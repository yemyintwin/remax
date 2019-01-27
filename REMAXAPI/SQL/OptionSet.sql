select os.*
from OptionSet os
	left outer join OptionSetGroup osg on os.GroupId = osg.Id
where osg.Name in (
	'AlertLevel',
	'Condition'
)