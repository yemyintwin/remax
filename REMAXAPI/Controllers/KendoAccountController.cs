using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using REMAXAPI.Models;

namespace REMAXAPI.Controllers
{
    public class JsonKendoGrid {
        public object[] items { get; set; }
    }

    public class KendoAccountController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoAccount
        public IQueryable<Account> GetAccounts()
        {
            return db.Accounts;
        }

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

        // POST: api/KendoAccount
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

        // DELETE: api/KendoAccount/5
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