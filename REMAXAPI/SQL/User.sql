-- Get user roles

select u.Id [UserId], u.FullName, ur.Id [RoleId], ur.Name
from UserUserRole uur
	left outer join [User] u on uur.UserId = u.Id
	left outer join [UserRole] ur on uur.RoleId = ur.Id
where u.email = 'user@jp.com'
-- u.Id = '27A8315D-2A45-E811-80C4-BC305B849686'