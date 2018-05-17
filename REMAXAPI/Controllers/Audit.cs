using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Core.Objects;
using System.Linq;
using System.Web;
using System.Reflection;
using System.Threading.Tasks;

namespace REMAXAPI.Models
{
    public partial class Remax_Entities : DbContext
    {
        public override Task<int> SaveChangesAsync()
        {
            var selectedEntityList = this.ChangeTracker.Entries()
                                    .Where(x => x.State == EntityState.Added || x.State == EntityState.Modified);

            User u = Util.GetCurrentUser();
            if (u != null && u.Id != null)
            {
                foreach (var e in selectedEntityList)
                {
                    object entity = e.Entity;
                    Type typeOfObject = entity.GetType();
                    if (typeOfObject != null)
                    {
                        PropertyInfo createdBy, createdOn, modifiedBy, modifiedOn;

                        createdBy = typeOfObject.GetProperty("CreatedBy");
                        createdOn = typeOfObject.GetProperty("CreatedOn");
                        modifiedBy = typeOfObject.GetProperty("ModifiedBy");
                        modifiedOn = typeOfObject.GetProperty("ModifiedOn");

                        if (e.State == EntityState.Added)
                        {
                            if (createdBy.PropertyType == typeof(Guid)) createdBy.SetValue(entity, u.Id);
                            if (createdOn.PropertyType == typeof(DateTime)) createdOn.SetValue(entity, DateTime.Now);
                            if (modifiedBy.PropertyType == typeof(Guid)) modifiedBy.SetValue(entity, u.Id);
                            if (modifiedOn.PropertyType == typeof(DateTime)) modifiedOn.SetValue(entity, DateTime.Now);
                        }
                        else if (e.State == EntityState.Modified)
                        {
                            if (modifiedBy.PropertyType == typeof(Guid)) modifiedBy.SetValue(entity, u.Id);
                            if (modifiedOn.PropertyType == typeof(DateTime)) modifiedOn.SetValue(entity, DateTime.Now);
                        }
                    }
                }
            }

            return base.SaveChangesAsync();
        }
    }
}