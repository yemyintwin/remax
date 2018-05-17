using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace REMAXAPI.Models.Kendo
{
    public class DataSort
    {
        public string Field { get; set; }
        public string Dir { get; set; }
    }

    public class DataAggregate {
        public string Aggregate { get; set; }
        public string Field { get; set; }
    }

    public class DataGroup
    {
        public IEnumerable<DataAggregate> Aggregates { get; set; }
        public string Dir { get; set; }
        public string Field { get; set; }
    }

    public class DataFilter
    {
        public string Field { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
        public IEnumerable<DataFilter> Filters { get; set; }

    }

    public static class DataFilterOperators
    {
        public static Dictionary<string, string> Operators
        {
            get
            {
                return new Dictionary<string, string>() {
                    { "eq", "{0} == \"{1}\""},
                    { "neq", "{0} != \"{1}\""},
                    { "isnull", "{0} == null"},
                    { "isnotnull", "{0} != null"},
                    { "lt", "{0} < {1}"},
                    { "lte", "{0} <= {1}"},
                    { "gt", "{0} > {1}"},
                    { "gte", "{0} >= {1}"},
                    { "startswith", "{0}.StartsWith(\"{1}\")"},
                    { "endswith", "{0}.EndsWith(\"{1}\")"},
                    { "contains", "{0}.Contains(\"{1}\")"},
                    { "doesnotcontain", "!{0}.Contains(\"{1}\")"},
                    { "isempty", "{0} == \"\""},
                    { "isnotempty", "{0} != \"\""}
                };
            }
        }
    }

    //public enum DataFilterOperators
    //{
    //    unkonwn,
    //    eq,
    //    neq,
    //    isnull,
    //    isnotnull,
    //    lt,
    //    lte,
    //    gt,
    //    gte,
    //    startswith,
    //    endswith,
    //    contains,
    //    doesnotcontain,
    //    isempty,
    //    isnotempty
    //}

    public class KendoRequest
    {
        public DataAggregate[] aggregate { get; set; }
        public DataGroup[] group { get; set; }
        public DataFilter filter { get; set; }
        public Object[] models { get; set; }
        public int page { get; set; }
        public int pageSize { get; set; }
        public int skip { get; set; }
        public DataSort[] sort { get; set; }
        public int take { get; set; }
        public string type { get; set; }
    }

    public class KendoResponse
    {
        public int Total { get; set; }
        public object[] Data { get; set; }
        public string ErrorMessage { get; set; }

        public KendoResponse(int total, object[] data)
        {
            this.Total = total;
            this.Data = data;
        }

        public KendoResponse(int total, object[] data, string error)
        {
            this.Total = total;
            this.Data = data;
            this.ErrorMessage = error;
        }
    }

    public class OptionResponse {
        public object[] Data { get; set; }
    }
}