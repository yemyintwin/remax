using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using REMAXAPI.Models;

namespace REMAXAPI.Controllers
{
    [Authorize]
    public class ChannelDataController : ApiController
    {
        private List<ChannelData> channelData = new List<ChannelData>();

        [HttpPost]
        public IEnumerable<ChannelData> GetAllChannelData()
        {
            this.channelData = new List<ChannelData>();

            string sampleFilePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/SampleChannelData.json");
            using (StreamReader r = new StreamReader(sampleFilePath))
            {
                string json = r.ReadToEnd();

                dynamic array = JsonConvert.DeserializeObject(json);
                foreach (var item in array)
                {
                    ChannelData d = new ChannelData()
                    {
                        Vessel = new Vessel() { Name = item.Vessel },
                        Engine = new Engine() { Name = item.Engine },
                        Channel = new Channel() { Name = item.Channel },
                        TimeStamp = item.TimeStamp,
                        Value = item.Value
                    };

                    this.channelData.Add(d);
                }
            }
            return this.channelData;
        }

        public IHttpActionResult GetProduct(int id)
        {
            return NotFound();
        }
    }
}
