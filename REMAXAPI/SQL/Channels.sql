
-- Pull add channel data
select c.ChannelNo, c.Name, c.ModelNoId, m.Name [ModelNoName], c.MinRange, c.MaxRange,  c.DisplayUnit, c.LowerLimit, c.UpperLimit, c.MonitoringTimer, c.DataTypeNo, os.Name [DataTypeName]
from Channel c
	left outer join Model m on c.ModelNoId = m.Id
	left outer join OptionSet os on c.DataTypeNo = os.Value
	inner join OptionSetGroup osg on os.GroupId = osg.Id and osg.Name = 'DataType'