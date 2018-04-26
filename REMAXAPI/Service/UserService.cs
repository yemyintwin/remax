using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Sql;
using System.Data.SqlClient;

using REMAXAPI.Models;
using REMAXAPI.Controllers;


namespace REMAXAPI.Service
{
    public class UserService
    {
        public User GetUserByCredentials(string email, string password) {
            /*
            SqlConnection connection = new SqlConnection("Data Source=SQL7004.site4now.net;Initial Catalog=DB_A38003_DEV;User Id=DB_A38003_DEV_admin;Password=yanmarsucks66!;");
            connection.Open();
            string strCommand = string.Format("select * from [user] where email = '{0}' and passwordhash = '{1}';",email, password);
            SqlCommand command = new SqlCommand(strCommand, connection);
            SqlDataAdapter dataAdapter = new SqlDataAdapter(command);
            DataTable dataTable = new DataTable();
            dataAdapter.Fill(dataTable);
            User user = null;
            if (dataTable.Rows.Count == 1) {
                DataRow dr = dataTable.Rows[0];
                user = new User() {
                    Id = new Guid(dr["Id"].ToString())
                    , Email = email
                    , EmailConfirmed = (bool)dr["EmailConfirmed"]
                    , FullName = dr["FullName"].ToString()
                };
            }
            connection.Close();
            */
            Remax_Entities entities = new Remax_Entities();
            User user = (
                            from u in entities.Users
                            where u.Email == email && u.PasswordHash == password
                            select u
                        ).FirstOrDefault();
            return user;
        }
    }
}