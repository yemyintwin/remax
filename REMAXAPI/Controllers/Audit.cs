using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Core.Objects;
using System.Linq;
using System.Web;
using System.Reflection;
using System.Threading.Tasks;
using System.Data.Entity.Validation;

namespace REMAXAPI.Models
{
    public partial class Remax_Entities : DbContext
    {
        readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        internal User ServiceUser { get; set; }
        internal Account RootAccount { get; set; }

        public override Task<int> SaveChangesAsync()
        {
            var selectedEntityList = this.ChangeTracker.Entries()
                                    .Where(x => x.State == EntityState.Added || x.State == EntityState.Modified);

            User u = null;

            if (ServiceUser == null)
            {
                try
                {
                    u = Util.GetCurrentUser();
                }
                catch (Exception ex)
                {
                    logger.Error(ex.Message, ex);
                }
            }
            else {
                u = this.ServiceUser;
            }
            
            if (u != null && u.Id != null)
            {
                foreach (var e in selectedEntityList)
                {
                    object entity = e.Entity;
                    Type typeOfObject = entity.GetType();
                    if (typeOfObject != null)
                    {
                        PropertyInfo createdBy, createdOn, modifiedBy, modifiedOn, id;

                        createdBy = typeOfObject.GetProperty("CreatedBy");
                        createdOn = typeOfObject.GetProperty("CreatedOn");
                        modifiedBy = typeOfObject.GetProperty("ModifiedBy");
                        modifiedOn = typeOfObject.GetProperty("ModifiedOn");
                        id = typeOfObject.GetProperty("Id");

                        if (e.State == EntityState.Added)
                        {
                            if (createdBy != null && (createdBy.PropertyType == typeof(Guid)|| createdBy.PropertyType == typeof(Guid?)))
                                createdBy.SetValue(entity, u.Id);
                            if (createdOn != null && (createdOn.PropertyType == typeof(DateTime) || createdOn.PropertyType == typeof(DateTime?)))
                                createdOn.SetValue(entity, DateTime.Now);
                            if (modifiedBy != null && (modifiedBy.PropertyType == typeof(Guid) || modifiedBy.PropertyType == typeof(Guid?)))
                                modifiedBy.SetValue(entity, u.Id);
                            if (modifiedOn != null && (modifiedOn.PropertyType == typeof(DateTime) || modifiedOn.PropertyType == typeof(DateTime?)))
                                modifiedOn.SetValue(entity, DateTime.Now);

                            if (typeOfObject != typeof(Client))
                            { 
                                if (id != null && (id.PropertyType == typeof(Guid) || id.PropertyType == typeof(Guid?)) 
                                    && (Guid)id.GetValue(entity) == Guid.Empty)
                                    id.SetValue(entity, Guid.NewGuid());
                            }
                        }
                        else if (e.State == EntityState.Modified)
                        {
                            if (modifiedBy != null && (modifiedBy.PropertyType == typeof(Guid) || modifiedBy.PropertyType == typeof(Guid?)))
                                modifiedBy.SetValue(entity, u.Id);
                            if (modifiedOn != null && (modifiedOn.PropertyType == typeof(DateTime) || modifiedOn.PropertyType == typeof(DateTime?)))
                                modifiedOn.SetValue(entity, DateTime.Now);
                        }
                    }
                }
            }

            try
            {
                return base.SaveChangesAsync();
            }
            catch (DbEntityValidationException e)
            {
                throw e;
            }
        }
    }
}