select m.IMO_No, v.VesselName, m.SerialNo, mo.Name, m.ChannelNo
	, c.Name, m.Value, a.AlertLevel, os.Name, a.Recipients
	, a.Subject, a.AlertMessage
from Alerts a with (nolock)
	join OptionSet os with (nolock) on a.AlertLevel = os.Value
	join OptionSetGroup osg with (nolock) on os.GroupId = osg.Id and osg.Name = 'AlertLevel'
	join Monitoring m with (nolock) on a.MonitoringId = m.Id
	join Vessel v with (nolock) on m.IMO_No = v.IMO_No
	join Engine e with (nolock) on m.SerialNo = e.SerialNo
	join Model mo with (nolock) on e.EngineModelID = mo.Id
	join Channel c with (nolock) on m.ChannelNo = c.ChannelNo