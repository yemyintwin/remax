using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace REMAXAPI.Models
{
    public class ChannelData
    {
        public Vessel Vessel { get; set; }
        public Engine Engine { get; set; }
        public Channel Channel { get; set; }
        public DateTime TimeStamp { get; set; }
        public decimal Value { get; set; }
    }
}