﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace REMAXAPI.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class Remax_Entities : DbContext
    {
        public Remax_Entities()
            : base("name=Remax_Entities")
        {
            this.Configuration.LazyLoadingEnabled = false;
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Account> Accounts { get; set; }
        public virtual DbSet<AlternatorMaker> AlternatorMakers { get; set; }
        public virtual DbSet<Channel> Channels { get; set; }
        public virtual DbSet<ChartType> ChartTypes { get; set; }
        public virtual DbSet<Country> Countries { get; set; }
        public virtual DbSet<DashboardSetting> DashboardSettings { get; set; }
        public virtual DbSet<Engine> Engines { get; set; }
        public virtual DbSet<EngineType> EngineTypes { get; set; }
        public virtual DbSet<Model> Models { get; set; }
        public virtual DbSet<Monitoring> Monitorings { get; set; }
        public virtual DbSet<OptionSet> OptionSets { get; set; }
        public virtual DbSet<OptionSetGroup> OptionSetGroups { get; set; }
        public virtual DbSet<Resource> Resources { get; set; }
        public virtual DbSet<ResourcePermission> ResourcePermissions { get; set; }
        public virtual DbSet<ShipClass> ShipClasses { get; set; }
        public virtual DbSet<ShipType> ShipTypes { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserClaim> UserClaims { get; set; }
        public virtual DbSet<UserLogin> UserLogins { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<Vessel> Vessels { get; set; }
        public virtual DbSet<GearboxModel> GearboxModels { get; set; }
        public virtual DbSet<Client> Clients { get; set; }
        public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
        public virtual DbSet<AlertSetting> AlertSettings { get; set; }
        public virtual DbSet<CountryTimezone> CountryTimezones { get; set; }
        public virtual DbSet<Alert> Alerts { get; set; }
        public virtual DbSet<EmailTemplate> EmailTemplates { get; set; }
        public virtual DbSet<ChannelGroup> ChannelGroups { get; set; }
    
        public virtual ObjectResult<sp_ResourcePermission_Result> sp_ResourcePermission(Nullable<System.Guid> userid, string resource_name, Nullable<int> operation_type)
        {
            var useridParameter = userid.HasValue ?
                new ObjectParameter("userid", userid) :
                new ObjectParameter("userid", typeof(System.Guid));
    
            var resource_nameParameter = resource_name != null ?
                new ObjectParameter("resource_name", resource_name) :
                new ObjectParameter("resource_name", typeof(string));
    
            var operation_typeParameter = operation_type.HasValue ?
                new ObjectParameter("operation_type", operation_type) :
                new ObjectParameter("operation_type", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_ResourcePermission_Result>("sp_ResourcePermission", useridParameter, resource_nameParameter, operation_typeParameter);
        }
    
        public virtual int sp_AssignRoles(Nullable<System.Guid> user, string roles)
        {
            var userParameter = user.HasValue ?
                new ObjectParameter("User", user) :
                new ObjectParameter("User", typeof(System.Guid));
    
            var rolesParameter = roles != null ?
                new ObjectParameter("Roles", roles) :
                new ObjectParameter("Roles", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_AssignRoles", userParameter, rolesParameter);
        }
    }
}
