
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create function [dbo].[fn_ResourcePermission](
	@userid uniqueidentifier,
	@resource_name nvarchar(100),
	@operation_type int
)
RETURNS int
BEGIN

	declare @resource_id int,
		@permission int

	select @resource_id = id 
	from Resource r
	where r.Name = @resource_name

	select @permission = case @operation_type
			when 1 then rp.ReadPermission 
			when 2 then rp.WritePermission 
			when 3 then rp.DeletePermission 
			when 4 then rp.ExecutePermission 
		end

	from ResourcePermission rp
		join UserUserRole urr on rp.RoleId = urr.RoleId
		left outer join UserRole ur on urr.RoleId = ur.Id
		left outer join [User] u on urr.UserId = u.Id
		left outer join Resource r on rp.ResourceId = r.Id
	where urr.UserId = @userid and r.Id = @resource_id

	return @permission
END
