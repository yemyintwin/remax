using REMAXAPI.Models;
using REMAXAPI.Models.DataTables;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;

namespace REMAXAPI.Controllers
{
    public class AccountsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpPost]
        [HttpGet]
        // GET: api/Accounts
        public DataTableResponse GetAccounts(DataTableRequest request)
        {
            IEnumerable<Account> filteredProducts;
            if (request.Search.Value != "")
            {
                var searchText = request.Search.Value.Trim();

                filteredProducts = db.Accounts.Where(a =>
                        a.AccountID.Contains(searchText) ||
                        a.Email.Contains(searchText) ||
                        a.MainPhone.Contains(searchText) ||
                        a.Fax.Contains(searchText) ||
                        a.Name.Contains(searchText) ||
                        a.PrimaryContact.Contains(searchText)
                        );
            }
            else
            {
                filteredProducts = db.Accounts;
            }

            string strOrderBy = string.Empty;
            if (request.Order.Length > 0) {
                foreach (var o in request.Order)
                    strOrderBy += string.Format("{0} {1},", request.Columns[o.Column].Data, o.Dir);

                if (strOrderBy.Length > 0 && strOrderBy.EndsWith(","))
                    strOrderBy = strOrderBy.Remove(strOrderBy.Length - 1);
            }

            var accounts = from a in filteredProducts
                           orderby (strOrderBy)
                           select new
                           {
                               a.Id,
                               a.AccountID,
                               a.Name,
                               a.MainPhone,
                               a.Email,
                               a.PrimaryContact,
                               a.Fax
                           };
            return new DataTableResponse() {
                draw = request.Draw,
                recordsTotal = accounts.Count(),
                recordsFiltered = accounts.Count(),
                data = accounts,
                error = ""
            };
        }

        //[HttpPost]
        //// GET: api/Accounts
        //public IQueryable<Object> GetAccounts([FromUri]PageParameterModel page)
        //{
        //    int skip = (page.pageNumber - 1) * page.pageSize; 

        //    var accounts = (from a in db.Accounts
        //                   select new
        //                   {
        //                       a.Id,
        //                       a.AccountID,
        //                       a.AccountName,
        //                       a.MainPhone,
        //                       a.Email,
        //                       a.PrimaryContact
        //                   }).Skip(skip).Take(page.pageSize);
        //    return accounts;
        //}

        // GET: api/Accounts/5
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

        // PUT: api/Accounts/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutAccount(Guid id, Account account)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != account.Id)
            {
                return BadRequest();
            }

            db.Entry(account).State = EntityState.Modified;

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

        // POST: api/Accounts
        [ResponseType(typeof(Account))]
        public async Task<IHttpActionResult> PostAccount(Account account)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
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

        // DELETE: api/Accounts/5
        [ResponseType(typeof(Account))]
        public async Task<IHttpActionResult> DeleteAccount(Guid id)
        {
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