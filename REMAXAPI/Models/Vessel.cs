using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace REMAXAPI.Models
{
    public class Vessel : Component
    {
        public List<Engine> Engines { get; set; }

        public Vessel() {
            this.Engines = new List<Engine>();
        }

        public Vessel(List<Engine> engines) {
            this.Engines = engines;
        }
    }
}