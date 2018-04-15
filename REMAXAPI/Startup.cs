using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Owin.Cors;
using Owin;

namespace REMAXAPI
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseCors(CorsOptions.AllowAll);
            ConfigureAuth(app);
        }
    }
}