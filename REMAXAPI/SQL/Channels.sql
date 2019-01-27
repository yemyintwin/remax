
-- Pull add channel data
select c.Id, c.ChannelNo, c.Name, c.ModelId, m.Name [ModelNoName], c.MinRange, c.MaxRange,  c.DisplayUnit, c.LowerLimit, c.UpperLimit, c.MonitoringTimer, c.DataTypeNo, os.Name [DataTypeName]
from Channel c
	left outer join Model m on c.ModelId = m.Id
	left outer join OptionSet os on c.DataTypeNo = os.Value
	inner join OptionSetGroup osg on os.GroupId = osg.Id and osg.Name = 'DataType'
order by CreatedOn desc