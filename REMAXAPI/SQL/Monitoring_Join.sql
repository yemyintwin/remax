select m.IMO_No, v.VesselName, m.SerialNo, ml.Name, m.ChannelNo, c.Name, ct.Name, m.Processed
from Monitoring m
	left outer join Vessel v on m.IMO_No = v.IMO_No
	left outer join Engine e on m.SerialNo = e.SerialNo
	left outer join Model ml on e.EngineModelID = ml.Id
	left outer join Channel c on c.ChannelNo = m.ChannelNo and c.ModelID = ml.Id
	left outer join ChartType ct on c.ChartTypeID = ct.Id