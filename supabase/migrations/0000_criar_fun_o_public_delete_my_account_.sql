create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Usuário não autenticado.';
  end if;

  delete from auth.users where id = uid;
end;
$function$;