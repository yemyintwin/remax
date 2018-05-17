/****** Object:  StoredProcedure [dbo].[sp_ResourcePermission]    Script Date: 13/5/2018 4:23:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[sp_ResourcePermission]
	-- Add the parameters for the stored procedure here
	@userid uniqueidentifier,
	@resource_name nvarchar(100),
	@operation_type int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	declare @resource_id int,
		@permission int
	-- Declare the return variable here
	select @resource_id = id 
	from Resource r
	where r.Name = @resource_name

	select u.Id			[User Id]
		, u.FullName	[User Name]
		, ur.Id			[Role Id]
		, ur.Name		[Role Name]
		, r.Id			[Resource Id]
		, r.Name		[Resource Name]
		, case @operation_type
			when 1 then rp.ReadPermission 
			when 2 then rp.WritePermission 
			when 3 then rp.DeletePermission 
			when 4 then rp.ExecutePermission 
		end [Resource Permission]

	from ResourcePermission rp
		join UserUserRole urr on rp.RoleId = urr.RoleId
		left outer join UserRole ur on urr.RoleId = ur.Id
		left outer join [User] u on urr.UserId = u.Id
		left outer join Resource r on rp.ResourceId = r.Id
	where urr.UserId = @userid and r.Id = @resource_id
END
