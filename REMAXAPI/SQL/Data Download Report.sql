declare @userAccount	uniqueidentifier
	, @userId		uniqueidentifier = '80BBCCFF-4B42-E811-80C4-BC305B849686'

select @userAccount = u.AccountId
from [User] u
where u.Id = @userId

select v.ID, v.VesselName + ' (' + v.IMO_No + ')' [VesselName]
from Vessel v
where v.OperatorID = @userAccount or 
	v.OwnerID = @userAccount

select top 1000 m.IMO_No, v.VesselName, m.SerialNo, ml.Name [Model Name], m.ChannelNo
	, c.Name [Channel Name], m.TimeStamp, m.Value, c.DisplayUnit
from Monitoring m
	left outer join Vessel v on m.IMO_No = v.IMO_No
	left outer join Engine e on m.SerialNo = e.SerialNo
	left outer join Model ml on e.EngineModelID = ml.Id
	left outer join Channel c on c.ChannelNo = m.ChannelNo and c.ModelID = ml.Id
	left outer join ChartType ct on c.ChartTypeID = ct.Id
where v.Id in ('5D9AAEFF-4D0F-4E74-AB55-AEF694B947AA')
order by m.IMO_No, m.SerialNo, c.ChannelNo, m.CreatedOn desc