using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace REMAXAPI.Models
{
    public static class Consts
    {
        public const string CONFIG_INCOMING_DIR = "Incmoing folder not found";
        public const string CONFIG_PROCESSING_DIR = "Processing folder not found";
        public const string CONFIG_ARCHIVE_DIR = "Archive folder not found";
        public const string CONFIG_ERROR_DIR = "Error folder not found";
        public const string INTEGRATION_FILE_HEADER_LENGTH = "Invalid data exchange format. {IMO No, Engine SN, Channel No, Channel Name, Timestamp, Value, Unit}";
    }

    public static class ErrorCodes {
        private static List<Dictionary<int, string>> _ErrorCodes = new List<Dictionary<int, string>>();

        public static List<Dictionary<int, string>> Codes { get { return _ErrorCodes; } }

        static ErrorCodes()
        {
            _ErrorCodes = new List<Dictionary<int, string>>();
            
        }
    }
}