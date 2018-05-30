using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using REMAXAPI;
using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;

namespace REMAXAPI.Controllers
{
    [Authorize]
    public class KendoUsersController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        //// GET: api/KendoUsers
        //public IQueryable<User> GetUsers()
        //{
        //    return db.Users;
        //}

        // GET: api/KendoUsers
        public KendoResponse GetUsers([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("User", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            IQueryable<Object> users = from u in db.Users
                                        join a in db.Accounts on u.AccountID equals a.Id into ua
                                        from a in ua.DefaultIfEmpty()
                                        where (u.AccountID == currentUser.AccountID.Value && readLevel == Util.AccessLevel.Own) || readLevel == Util.AccessLevel.All
                                        // do not remove above where caluse, this is for access permission
                                        select u;

            //loading related entites
            users = users.Include("Account");

            // total count
            var total = users.Count();

            // filtering
            if (kendoRequest.filter != null && kendoRequest.filter.Filters != null && kendoRequest.filter.Filters.Count() > 0)
            {
                IEnumerable<DataFilter> filters = kendoRequest.filter.Filters;
                string strWhere = string.Empty;
                foreach (var f in filters)
                {
                    string whereFormat = DataFilterOperators.Operators[f.Operator];
                    if (!string.IsNullOrEmpty(whereFormat))
                    {
                        users = users.Where(string.Format(whereFormat, f.Field, f.Value));
                    }
                }
            }

            // sorting
            string strOrderBy = string.Empty;
            if (kendoRequest.sort != null && kendoRequest.sort.Length > 0)
            {
                foreach (var s in kendoRequest.sort)
                {
                    strOrderBy += string.Format("{0} {1},", s.Field, s.Dir);
                }

                if (strOrderBy.Length > 0 && strOrderBy.EndsWith(","))
                    strOrderBy = strOrderBy.Remove(strOrderBy.Length - 1); //Removing last comma
            }
            if (strOrderBy == string.Empty) strOrderBy = "1"; //Sort Noting

            var sortedUsers = users.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedUsers.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoUsers/5
        [ResponseType(typeof(User))]
        public async Task<IHttpActionResult> GetUser(Guid id)
        {
            int readLevel = Util.GetResourcePermission("User", Util.ReourceOperations.Read);
            if (readLevel == 0) return NotFound();

            User user = await db.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/KendoUsers/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutUser(Guid id, User user)
        {
            int writeLevel = Util.GetResourcePermission("User", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != user.Id)
            {
                return BadRequest();
            }

            DbEntityEntry entry = db.Entry(user);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            User defaultUser = new User();
            entry = Util.GetUpdatedProperties(defaultUser, user, entry);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex) {
                throw ex;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/KendoUsers
        [ResponseType(typeof(User))]
        public async Task<IHttpActionResult> PostUser(User user)
        {
            int writeLevel = Util.GetResourcePermission("User", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            var usr = db.Users.Where(u => u.Email == user.Email).FirstOrDefault();
            if (usr != null) ModelState.AddModelError("Duplicate", "Duplicate IMO Number.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = user.Id }, user);
        }

        // DELETE: api/KendoUsers/5
        [ResponseType(typeof(User))]
        public async Task<IHttpActionResult> DeleteUser(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("User", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            User user = await db.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            if (user.IsRootUser.HasValue && user.IsRootUser.Value) {
                return InternalServerError(new Exception("Root account cannot be deleted from system."));
            }
            db.Users.Remove(user);
            await db.SaveChangesAsync();

            return Ok(user);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserExists(Guid id)
        {
            return db.Users.Count(e => e.Id == id) > 0;
        }
    }
}