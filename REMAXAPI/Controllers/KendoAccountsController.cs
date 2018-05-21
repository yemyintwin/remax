using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Net.Http;

namespace REMAXAPI.Controllers
{
    [Authorize]
    public class KendoAccountsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoAccounts
        //public KendoResponse GetAccounts()
        //{
        //    var total = db.Accounts.Count();
        //    object[] data = db.Accounts.ToArray<object>();

        //    return new KendoResponse(total, data);
        //}

        // GET: api/KendoAccounts
        public KendoResponse GetAccounts([FromUri] KendoRequest kendoRequest)
        {
            IQueryable<Account> accounts = db.Accounts;

            // total count
            var total = db.Accounts.Count();

            // filtering
            if (kendoRequest.filter != null && kendoRequest.filter.Filters != null && kendoRequest.filter.Filters.Count()>0) {
                IEnumerable<DataFilter> filters = kendoRequest.filter.Filters;
                string strWhere = string.Empty;
                foreach (var f in filters)
                {
                    string whereFormat = DataFilterOperators.Operators[f.Operator];
                    if (!string.IsNullOrEmpty(whereFormat)) {
                        accounts = accounts.Where(string.Format(whereFormat, f.Field, f.Value));
                    }
                }
            }

            // sorting
            string strOrderBy = string.Empty;
            if (kendoRequest.sort != null && kendoRequest.sort.Length > 0) {
                foreach (var s in kendoRequest.sort)
                {
                    strOrderBy += string.Format("{0} {1},", s.Field, s.Dir);
                }

                if (strOrderBy.Length > 0 && strOrderBy.EndsWith(","))
                    strOrderBy = strOrderBy.Remove(strOrderBy.Length - 1); //Removing last comma
            }
            if (strOrderBy == string.Empty) strOrderBy = "1"; //Sort Noting

            var sortedAccounts = accounts.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedAccounts.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        //// GET: api/KendoAccount
        //public KendoResponse GetAccounts(int pageSize, int skip, string orderBy)
        //{
        //    var total = db.Accounts.Count();
        //    var accounts = db.Accounts.OrderBy(orderBy);
        //    object[] data = accounts.Skip(skip).Take(pageSize).ToArray<object>();

        //    return new KendoResponse(total, data);
        //}

        //public Object GetAccounts()
        //{
        //    KendoGridResponse response = new KendoGridResponse()
        //    {
        //        items = db.Accounts.ToArray()
        //    };
        //    return response;
        //}

        // GET: api/KendoAccount/5
        [ResponseType(typeof(Account))]
        public async Task<IHttpActionResult> GetAccount(Guid id)
        {
            Account account = await db.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            return Ok(account);
        }

        // PUT: api/KendoAccount/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutAccount(Guid id, Account account)
        {
            int writeLevel = Util.GetResourcePermission("Account", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != account.Id)
            {
                return BadRequest();
            }

            DbEntityEntry entry = db.Entry(account);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            Account defaultAccount = new Account();
            entry = Util.GetUpdatedProperties(defaultAccount, account, entry);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/KendoAccount
        [ResponseType(typeof(Account))]
        public async Task<IHttpActionResult> PostAccount(Account account)
        {
            int writeLevel = Util.GetResourcePermission("Account", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }

            var acc = db.Accounts.Where(a => a.AccountID == account.AccountID).FirstOrDefault();
            if (acc != null) ModelState.AddModelError("Duplicate", "Duplicate account ID.");

            if (!ModelState.IsValid)
            {
                string strError = string.Empty;
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var error in modelState.Errors)
                    {
                        strError += error.ErrorMessage + Environment.NewLine;
                    }
                }

                var response = new HttpResponseMessage(HttpStatusCode.NotFound)
                {
                    Content = new StringContent(strError, System.Text.Encoding.UTF8, "text/plain"),
                    StatusCode = HttpStatusCode.InternalServerError
                };
                throw new HttpResponseException(response);
                //return BadRequest(ModelState);
            }
            db.Accounts.Add(account);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (AccountExists(account.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = account.Id }, account);
        }

        // DELETE: api/KendoAccount/5
        [ResponseType(typeof(Account))]
        public async Task<IHttpActionResult> DeleteAccount(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Account", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            Account account = await db.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            db.Accounts.Remove(account);
            await db.SaveChangesAsync();

            return Ok(account);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AccountExists(Guid id)
        {
            return db.Accounts.Count(e => e.Id == id) > 0;
        }
    }
}