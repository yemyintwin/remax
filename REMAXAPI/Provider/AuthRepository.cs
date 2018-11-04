using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using com.ymw.security;
using REMAXAPI.Models;

namespace REMAXAPI.Provider
{
    public class AuthRepository : IDisposable
    {
        private Remax_Entities _ctx;

        public AuthRepository()
        {
            _ctx = new Remax_Entities();
        }

        public async Task<User> FindUser(string userName, string password)
        {
            return await Task.Run(() =>
            {
                User user = (from u in _ctx.Users
                             where u.Email == userName
                             select u).FirstOrDefault();

                if (user != null)
                {
                    byte[] hashBytes = Util.StringToByteArray(user.PasswordHash);
                    PasswordHash hash = new PasswordHash(hashBytes);
                    if (!hash.Verify(password)) user = null;
                }

                return user;
            });
        }

        public Client FindClient(string clientId)
        {
            var client = _ctx.Clients.Find(clientId);

            return client;
        }

        public Client AddClient(string clientId, string username) {
                Client c = new Client()
                {
                    Active = true,
                    ApplicationType = (int)ApplicationTypes.JavaScript,
                    AllowedOrigin = "*",
                    Id = clientId,
                    Name = username,
                    RefreshTokenLifeTime = (60*24*7), // 30 days refresh time
                    Secret = null
                };
                _ctx.Clients.Add(c);
                int t = _ctx.SaveChanges();
            if (t == 1) return c;
            else return null;
        }

        public async Task<bool> AddRefreshToken(RefreshToken token)
        {

            var existingToken = _ctx.RefreshTokens.Where(r => r.Subject == token.Subject && r.ClientId == token.ClientId).SingleOrDefault();

            if (existingToken != null)
            {
                var result = await RemoveRefreshToken(existingToken);
            }

            _ctx.RefreshTokens.Add(token);

            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveRefreshToken(string refreshTokenId)
        {
            var refreshToken = await _ctx.RefreshTokens.FindAsync(refreshTokenId);

            if (refreshToken != null)
            {
                _ctx.RefreshTokens.Remove(refreshToken);
                return await _ctx.SaveChangesAsync() > 0;
            }

            return false;
        }

        public async Task<bool> RemoveRefreshToken(RefreshToken refreshToken)
        {
            _ctx.RefreshTokens.Remove(refreshToken);
            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<RefreshToken> FindRefreshToken(string refreshTokenId)
        {
            var refreshToken = await _ctx.RefreshTokens.FindAsync(refreshTokenId);

            return refreshToken;
        }

        public List<RefreshToken> GetAllRefreshTokens()
        {
            return _ctx.RefreshTokens.ToList();
        }

        public void Dispose()
        {
            _ctx.Dispose();
        }
    }
}