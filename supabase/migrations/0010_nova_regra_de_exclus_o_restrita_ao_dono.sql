create policy "Exames exclusao do dono"
on storage.objects for delete to authenticated
using (
  bucket_id = 'exams'
  and exists (
    select 1 from public.children c
    where c.id::text = split_part(name, '/', 1)
      and c.user_id = auth.uid()
  )
);