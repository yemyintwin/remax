using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace REMAXAPI.Models.DataTables
{
    public class DataTableModelBinder : IModelBinder
    {
        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            if (bindingContext.ModelType != typeof(DataTableRequest))
            {
                return false;
            }

            var model = (DataTableRequest)bindingContext.Model ?? new DataTableRequest();

            model.Draw = Convert.ToInt32(GetValue(bindingContext, "draw"));
            model.Start = Convert.ToInt32(GetValue(bindingContext, "start"));
            model.Length = Convert.ToInt32(GetValue(bindingContext, "length"));

            // Search
            model.Search = new DataTableSearch
            {
                Value = GetValue(bindingContext, "search.value"),
                Regex = Convert.ToBoolean(GetValue(bindingContext, "search.regex"))
            };


            // Order
            var o = 0;
            var order = new List<DataTableOrder>();
            while (GetValue(bindingContext, "order[" + o + "].column") != null)
            {
                order.Add(new DataTableOrder
                {
                    Column = Convert.ToInt32(GetValue(bindingContext, "order[" + o + "].column")),
                    Dir = GetValue(bindingContext, "order[" + o + "].dir")
                });
                o++;
            }
            model.Order = order.ToArray();

            // Columns
            var c = 0;
            var columns = new List<DataTableColumn>();
            while (GetValue(bindingContext, "columns[" + c + "].data") != null)
            {
                columns.Add(new DataTableColumn
                {
                    Data = GetValue(bindingContext, "columns[" + c + "].data"),
                    Name = GetValue(bindingContext, "columns[" + c + "].name"),
                    Orderable = Convert.ToBoolean(GetValue(bindingContext, "columns[" + c + "].orderable")),
                    Searchable = Convert.ToBoolean(GetValue(bindingContext, "columns[" + c + "].searchable")),
                    Search = new DataTableSearch
                    {
                        Value = GetValue(bindingContext, "columns[" + c + "][search].value"),
                        Regex = Convert.ToBoolean(GetValue(bindingContext, "columns[" + c + "].search.regex"))
                    }
                });
                c++;
            }
            model.Columns = columns.ToArray();

            bindingContext.Model = model;

            return true;
        }

        private string GetValue(ModelBindingContext context, string key)
        {
            var result = context.ValueProvider.GetValue(key);
            return result == null ? null : result.AttemptedValue;
        }
    }
}