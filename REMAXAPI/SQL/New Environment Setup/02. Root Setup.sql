declare @emptyGUID uniqueidentifier
	, @root_account uniqueidentifier
	, @root_user uniqueidentifier
	, @admin_user uniqueidentifier
	, @service_user uniqueidentifier
	, @root_role uniqueidentifier
	, @admin_role uniqueidentifier
	, @user_role uniqueidentifier
	, @service_role uniqueidentifier
	, @now datetime

select @emptyGUID = cast(cast(0 as binary) as uniqueidentifier)
	, @root_account = 'ADE943CD-3245-E811-80C4-BC305B849686'
	, @root_user = 'F5F5524D-2A45-E811-80C4-BC305B849686'
	, @admin_user = '80BBCCFF-4B42-E811-80C4-BC305B849686'
	, @service_user = '59A396EB-DF64-E811-B8BD-985FD3CAFDA6'
	, @root_role = '2CF73419-2A45-E811-80C4-BC305B849686'
	, @admin_role = '2DF73419-2A45-E811-80C4-BC305B849686'
	, @user_role = '983DF220-2A45-E811-80C4-BC305B849686'
	, @service_role = '2D8FA64B-E764-E811-B8BD-985FD3CAFDA6'
	, @now = GETDATE()

-- Drop existing data
delete from [UserRole]
delete from [UserUserRole] where UserId in (select id from [User] where AccountID = @root_account)
delete from [User] where AccountID = @root_account
delete from Account where Id = @root_account

-- Creating Root Account
insert into [Account](Id, AccountID, [Name], CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
values (@root_account, 'Root-Account', 'Daikai Pte. Ltd.', @root_user, @now, @root_user, @now)

-- Creating Root and Service User
insert into [User](Id, Email, PasswordHash, FullName, AccountID, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
values 
(@root_user, 'root@daikai.com', 'd11789c6b87c2fc3948c1baff1d7afed1edd23f325d0444358b019fdaa3f3ffe7b47d62f','Root', @root_account, @root_user, @now, @root_user, @now),
(@admin_user, 'remax@daikai.com', 'd11789c6b87c2fc3948c1baff1d7afed1edd23f325d0444358b019fdaa3f3ffe7b47d62f','Remax', @root_account, @root_user, @now, @root_user, @now),
(@service_user, 'service@daikai.com', 'd11789c6b87c2fc3948c1baff1d7afed1edd23f325d0444358b019fdaa3f3ffe7b47d62f','System Service', @root_account, @root_user, @now, @root_user, @now)
/* -- password is 'mypassword' -- */

-- Creating User Roles
insert into UserRole (Id, Name)
values (@root_role, 'Root'),
	(@admin_role, 'Admin'),
	(@user_role, 'Business User'),
	(@service_role, 'Service')

-- Creating User's security Roles
insert into UserUserRole (RoleId, UserId)
values (@admin_role, @admin_user),
(@root_role, @root_user),
(@service_role, @service_user)