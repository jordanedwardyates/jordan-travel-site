-- LCC AI Sales Assistant | 2026-10-12
-- Booking-aware daily command center; intentionally NOT auto-sending or confirming bookings.
-- Run as a reviewed Supabase migration; do not execute via public client.
create or replace view public.advisor_daily_command_center
with (security_invoker = true) as
with linked_departures as (
  select qi.quote_package_id,
         min(v.embarkation_date) filter (where v.embarkation_date >= current_date) as next_linked_departure
  from public.quote_items qi
  join public.price_offers po on po.id = qi.price_offer_id
  join public.accommodations a on a.id = po.accommodation_id
  join public.voyages v on v.id = a.voyage_id
  group by qi.quote_package_id
),
quote_source as (
  select lower(btrim(p.client_name)) as client_key,
         (c.quote_package_id is not null) as booking_reference_present,
         coalesce(
           ld.next_linked_departure,
           case when pg_input_is_valid(p.raw_source_data->>'departure_text', 'date')
                then (p.raw_source_data->>'departure_text')::date end
         ) as departure_date
  from public.quote_packages p
  left join public.advisor_booking_reconciliation_candidates c
    on c.quote_package_id = p.id
  left join linked_departures ld on ld.quote_package_id = p.id
  where p.client_name is not null
),
quote_scope as (
  select client_key,
         count(*) as total_packages,
         count(*) filter (where not booking_reference_present) as nonbooking_packages,
         count(*) filter (where booking_reference_present) as booking_reference_packages,
         min(departure_date) filter (
           where not booking_reference_present and departure_date >= current_date
         ) as next_nonbooking_departure
  from quote_source group by client_key
),
sales as (
  select q.client_name,
         case when s.next_nonbooking_departure <= current_date + 30
                   and q.work_type <> 'review_intake'
              then 'verify_near_term_quote' else q.work_type end as work_type,
         case when s.next_nonbooking_departure <= current_date + 7
                   then greatest(q.priority_score, 95)
              when s.next_nonbooking_departure <= current_date + 30
                   then greatest(q.priority_score, 85)
              else q.priority_score end as priority_score,
         q.contactability_status,
         s.next_nonbooking_departure as departure_date,
         s.next_nonbooking_departure - current_date as days_until_departure,
         coalesce(s.nonbooking_packages, q.quote_count) as source_record_count,
         case when s.next_nonbooking_departure <= current_date + 30 then
                'Near-term historical quote: verify sailing, availability, current price, client intent, and source provenance before outreach.' ||
                case when q.contactability_status = 'missing_contact'
                     then ' Contact details must also be independently recovered.'
                     else '' end
              else q.recommended_action end as recommended_action,
         q.source_lane,
         false as booking_reference_present,
         true as requires_precontact_review
  from public.advisor_today_work_queue q
  left join quote_scope s on s.client_key = lower(btrim(q.client_name))
  -- Never suppress a separate unbooked quote because the client also has a booking ref.
  where coalesce(s.nonbooking_packages, 0) > 0
     or coalesce(s.total_packages, 0) = 0
     or q.source_lane = 'promotion'
),
booking as (
  select b.client_group as client_name,
         b.service_lane as work_type,
         case when b.days_until_sailing < 0 then 35
              when b.days_until_sailing <= 30 then 90
              when b.days_until_sailing <= 60 then 75
              when b.days_until_sailing <= 90 then 65
              else 50 end as priority_score,
         'contact_not_verified'::text as contactability_status,
         b.earliest_departure as departure_date,
         b.days_until_sailing as days_until_departure,
         b.package_count as source_record_count,
         b.recommended_action,
         'booking_service_review'::text as source_lane,
         true as booking_reference_present,
         true as requires_precontact_review
  from public.advisor_booking_service_worklist b
)
select * from booking
union all
select * from sales;

-- Internal-only access; service-role server paths only.
revoke all on public.advisor_daily_command_center from public, anon, authenticated;
grant select on public.advisor_daily_command_center to service_role;

-- After deployment, verify:
-- select source_lane, count(*) from public.advisor_daily_command_center group by 1;
-- select client_name, work_type, priority_score, departure_date
-- from public.advisor_daily_command_center order by priority_score desc;
-- select reloptions from pg_class
-- where oid = 'public.advisor_daily_command_center'::regclass;
