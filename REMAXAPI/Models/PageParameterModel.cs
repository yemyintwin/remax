using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace REMAXAPI.Models
{
    public class PageParameterModel
    {
        const int maxPageSize = 100;

        public string sorting { get; set; }

        public int pageNumber { get; set; } = 1;

        private int _pageSize { get; set; } = 10;

        public int pageSize {
            get { return _pageSize; }
            set {
                _pageSize = (value > maxPageSize) ? maxPageSize : value;
            }
        }

        public static string GetSortingString(PageParameterModel page, string defaultColumn, out int skip) {
            skip = (page.pageNumber - 1) * page.pageSize;
            string[] sorting = page.sorting.Split(new char[] { ' ' });
            string sortColumn, sortOrder, strSorting;

            sortColumn = sortOrder = strSorting = string.Empty;

            if (sorting.Length == 2)
            {
                sortColumn = sorting[0];
                sortOrder = sorting[1].ToLower();
            }

            if (new Channel().GetType().GetProperty(sortColumn) == null) sortColumn = defaultColumn;
            if (sortOrder != "asc" && sortOrder != "desc") sortOrder = "asc";
            strSorting = string.Format("{0} {1}", sortColumn, sortOrder);

            return strSorting;
        }
    }
}