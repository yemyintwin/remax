using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;

using REMAXAPI.Models;

namespace REMAXAPI.Controllers
{
    public class ScheduleJobController : ApiController
    {
        readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private const string INCOMING_DIR = "IncomingDir";
        private const string PROCESSING_DIR = "Processing";
        private const string ARCHIVE_DIR = "Archive";
        private const string ERROR_DIR = "Error";

        public string IncomingFilePath { get; set; }
        public string ProcessingFilePath { get; set; }
        public string ArchiveFilePath { get; set; }
        public string ErrorFilePath { get; set; }

        public ScheduleJobController() {
            if (string.IsNullOrWhiteSpace(IncomingFilePath)) {
                if (ConfigurationManager.AppSettings.AllKeys.Contains(INCOMING_DIR)) {
                    string relativePath = ConfigurationManager.AppSettings.Get(INCOMING_DIR);
                    string absolutPath = HttpContext.Current.Server.MapPath(relativePath);

                    IncomingFilePath = absolutPath;
                    ProcessingFilePath = string.Format(@"{0}\{1}", absolutPath, PROCESSING_DIR);
                    ArchiveFilePath = string.Format(@"{0}\{1}", absolutPath, ARCHIVE_DIR);
                    ErrorFilePath = string.Format(@"{0}\{1}", absolutPath, ERROR_DIR);

                    bool configError = false;
                    if (!Directory.Exists(IncomingFilePath))
                    {
                        logger.Error(string.Format("{0}\n{1}", Consts.CONFIG_INCOMING_DIR, IncomingFilePath));
                        configError = true;
                    }
                    if (!Directory.Exists(ProcessingFilePath))
                    {
                        logger.Error(string.Format("{0}\n{1}", Consts.CONFIG_PROCESSING_DIR, ProcessingFilePath));
                        configError = true;
                    }
                    if (!Directory.Exists(ArchiveFilePath))
                    {
                        logger.Error(string.Format("{0}\n{1}", Consts.CONFIG_ARCHIVE_DIR, ArchiveFilePath));
                        configError = true;
                    }
                    if (!Directory.Exists(ErrorFilePath))
                    {
                        logger.Error(string.Format("{0}\n{1}", Consts.CONFIG_INCOMING_DIR, ErrorFilePath));
                        configError = true;
                    }

                    if (configError) {
                        throw new Exception("Configuration Error");
                    }
                }
            }
        }

        [Route("api/ScheduleJob/ProcessFiles")]
        [HttpGet]
        public void ProcessFiles() {
            // Process the list of files found in the directory.
            string[] fileEntries = Directory.GetFiles(this.IncomingFilePath);
            foreach (string fileName in fileEntries)
            {
                try
                {
                    string fileNameWithoutPath = Path.GetFileName(fileName);
                    string processingFile = string.Format(@"{0}\{1}", this.ProcessingFilePath, fileNameWithoutPath);
                    string archiveFile = string.Format(@"{0}\{1}", this.ArchiveFilePath, fileNameWithoutPath);
                    string errorFile = string.Format(@"{0}\{1}", this.ErrorFilePath, fileNameWithoutPath);
                    List<string> errorList = new List<string>();
                    FileProcessSummary summary = new FileProcessSummary();

                    // Move file to processing folder
                    File.Move(fileName, processingFile);

                    // Process file
                    bool hasError = ProcessSingleFile(processingFile, out errorList, out summary);
                    logger.DebugFormat("File Name : {0}", fileNameWithoutPath);
                    logger.DebugFormat("Summary - Start Time: {0}", summary.StartTime);
                    logger.DebugFormat("Summary - End Time: {0}", summary.EndTime);
                    logger.DebugFormat("Summary - Total Line: {0}", summary.Total);
                    logger.DebugFormat("Summary - Success: {0}", summary.Success);
                    logger.DebugFormat("Summary - Failure: {0}", summary.Failure);
                    logger.DebugFormat("{0}", new string('-',50));

                    // Archive file
                    File.Move(processingFile, archiveFile);

                    // Error file
                    if (hasError) {
                        StreamWriter sw = File.CreateText(errorFile);
                        foreach (var errLine in errorList)
                        {
                            sw.WriteLine(errLine);
                        }
                        sw.Close();
                    }
                }
                catch (Exception ex)
                {
                    logger.Error(ex.Message, ex);
                }
            }
        }

        protected bool ProcessSingleFile(string fileNamePath, out List<string> errorList, out FileProcessSummary summary) {
            string[] lines = File.ReadAllLines(fileNamePath);
            bool hasError = false;
            long totalLine = lines.Length;

            string headerLine = lines[0];
            string[] header = headerLine.Split(new char[] { ',' });

            if (header.Length != 7)
            {
                logger.Error(Consts.INTEGRATION_FILE_HEADER_LENGTH);
                throw new FileProcessingException(Consts.INTEGRATION_FILE_HEADER_LENGTH, FileProcessingException.ErrorType.File);
            }

            errorList = new List<string>();
            errorList.Add(headerLine);

            summary = new FileProcessSummary();
            summary.Total = lines.Length - 1;
            summary.StartTime = DateTime.Now;

            List<Monitoring> monitoringList = new List<Monitoring>();

            for (long i = 1; i < lines.Length; i++)
            {
                long currentLine = i;
                string line = lines[i];

                Regex CSVParser = new Regex(",(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))");

                string[] raw = CSVParser.Split(line);
                //string[] raw = line.Split(new char[] { ',' });

                try
                {
                    Monitoring monitor = new Monitoring();

                    // IMO Number
                    if (!string.IsNullOrWhiteSpace(raw[0])) monitor.IMO_No = RemoveDoubleQuotes(raw[0]);
                    // Engine Serial No.
                    if (!string.IsNullOrWhiteSpace(raw[1])) monitor.SerialNo = RemoveDoubleQuotes(raw[1]);
                    // Channel No
                    if (!string.IsNullOrWhiteSpace(raw[2])) monitor.ChannelNo = int.Parse(raw[2]);
                    // Channel Description
                    if (!string.IsNullOrWhiteSpace(raw[3])) monitor.ChannelDescription= RemoveDoubleQuotes(raw[3]);
                    // TimeStamp
                    if (!string.IsNullOrWhiteSpace(raw[4])) monitor.TimeStamp = DateTime.Parse(raw[4]);
                    // Data Value
                    if (!string.IsNullOrWhiteSpace(raw[5])) monitor.Value = RemoveDoubleQuotes(raw[5]);
                    // Unit of Measurement
                    if (!string.IsNullOrWhiteSpace(raw[6])) monitor.Unit = RemoveDoubleQuotes(raw[6]);

                    // System Info
                    monitor.Id = Guid.NewGuid();
                    monitor.CreatedBy = Guid.Empty;
                    monitor.CreatedOn = DateTime.Now;
                    monitor.ModifiedBy = Guid.Empty;
                    monitor.ModifiedOn = DateTime.Now;

                    monitoringList.Add(monitor);
                    summary.Success = summary.Success++;
                }
                catch (Exception ex)
                {
                    errorList.Add(string.Format("{0},{1},{2}", line, i.ToString(), ex.Message));
                    hasError = true;
                    summary.Failure = summary.Failure++;
                    continue;
                }
            }
            summary.EndTime = DateTime.Now;

            Remax_Entities remax_Entities = new Remax_Entities();
            remax_Entities.Monitorings.AddRange(monitoringList);

            int recordAffected = 0;
            try
            {
                recordAffected = remax_Entities.SaveChanges();
            }
            catch (Exception ex)
            {
                hasError = true;
                logger.Error(ex.Message, ex);
            }
            summary.DatabaseInsert = recordAffected;
            return hasError;
        }

        private string RemoveDoubleQuotes(string str)
        {
            bool startQuote = str.StartsWith("\"");
            bool endQuote = str.EndsWith("\"");

            if (startQuote && endQuote && str.Length >= 2)
            {
                str = str.Remove(0, 1); //Removing first quote
                str = str.Remove(str.Length - 1, 1); //Removing last quote
            }

            return str;
        }
    }

    public class FileProcessingException : Exception {
        public enum ErrorType {
            File,
            Record
        }

        public ErrorType ExceptionErrorType { get; set; }

        public FileProcessingException(string ErrorMessage, ErrorType errorType) : base(ErrorMessage) {
            this.ExceptionErrorType = errorType;
        }
    }

    public class FileProcessSummary {
        public int Total { get; set; } = 0;
        public int Success { get; set; } = 0;
        public int Failure { get; set; } = 0;
        public int DatabaseInsert { get; set; } = 0;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
