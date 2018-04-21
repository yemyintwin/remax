using System;

namespace REMAXAPI.Controllers
{
    public class ChannelData
    {
        public string Vessel { get; set; }
        public string Engine { get; set; }
        public string Channel { get; set; }
        public DateTime TimeStamp { get; set; }
        public string Value { get; set; }
    }
}