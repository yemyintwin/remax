using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using Newtonsoft.Json;
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
                        string strError = string.Format("Configuration Error {0} Incoming : {1} {0}Processing : {2}, {0}Error : {3} {0}Archive : {4}{0}",
                            Environment.NewLine,
                            IncomingFilePath,
                            ProcessingFilePath,
                            ErrorFilePath,
                            ArchiveFilePath
                        );
                        throw new Exception(strError);
                    }
                }
            }
        }

        [HttpGet]
        [ResponseType(typeof(void))]
        [Route("api/ScheduleJob/ProcessFiles")]
        public async Task<IHttpActionResult> ProcessFiles() {
            logger.InfoFormat("Process start at {0}", DateTime.Now);
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

                    // Move file to processing folder
                    if (File.Exists(processingFile)) File.Delete(processingFile);
                    File.Move(fileName, processingFile);

                    // Process file
                    FileProcessSummary summary = await ProcessSingleFile(processingFile);

                    logger.DebugFormat("File Name : {0}", fileNameWithoutPath);
                    logger.DebugFormat("Summary - Start Time: {0}", summary.StartTime);
                    logger.DebugFormat("Summary - End Time: {0}", summary.EndTime);
                    logger.DebugFormat("Summary - Total Line: {0}", summary.Total);
                    logger.DebugFormat("Summary - Success: {0}", summary.Success);
                    logger.DebugFormat("Summary - Failure: {0}", summary.Failure);

                    // Archive file
                    if (File.Exists(archiveFile)) {
                        archiveFile = GetFileName(archiveFile);
                    }

                    File.Move(processingFile, archiveFile);

                    // Error file
                    if (!summary.SuccessfullyProcessed) {
                        errorFile = GetFileName(errorFile);
                        StreamWriter sw = File.CreateText(errorFile);
                        foreach (var errLine in summary.ErrorList)
                        {
                            await sw.WriteLineAsync(errLine);
                        }
                        sw.Close();
                    }
                }
                catch (Exception ex)
                {
                    logger.Error(ex.Message, ex);
                }
            }
            logger.InfoFormat("Process end at {0}", DateTime.Now);
            logger.InfoFormat(new string('-', 50));
            logger.InfoFormat(Environment.NewLine);
            return StatusCode(HttpStatusCode.OK);
        }

        protected async Task<FileProcessSummary> ProcessSingleFile(string fileNamePath) {
            FileProcessSummary summary = new FileProcessSummary();
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

            summary.ErrorList = new List<string>();
            summary.ErrorList.Add(headerLine);

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
                    if (!string.IsNullOrWhiteSpace(raw[2])) monitor.ChannelNo = RemoveDoubleQuotes(raw[2]);
                    // Channel Description
                    if (!string.IsNullOrWhiteSpace(raw[3])) monitor.ChannelDescription= RemoveDoubleQuotes(raw[3]);
                    // TimeStamp
                    if (!string.IsNullOrWhiteSpace(raw[4])) monitor.TimeStamp = DateTime.Parse(raw[4]);
                    // Data Value
                    if (!string.IsNullOrWhiteSpace(raw[5])) monitor.Value = RemoveDoubleQuotes(raw[5]);
                    // Unit of Measurement
                    if (!string.IsNullOrWhiteSpace(raw[6])) monitor.Unit = RemoveDoubleQuotes(raw[6]);

#if DEBUG
                    monitor.TimeStamp = DateTime.Now;
#endif 

                    // System Info
                    //monitor.Id = Guid.NewGuid();
                    //monitor.CreatedBy = Guid.Empty;
                    //monitor.CreatedOn = DateTime.Now;
                    //monitor.ModifiedBy = Guid.Empty;
                    //monitor.ModifiedOn = DateTime.Now;

                    monitoringList.Add(monitor);
                    summary.Success = summary.Success++;
                }
                catch (Exception ex)
                {
                    summary.ErrorList.Add(string.Format("{0},{1},{2}", line, i.ToString(), ex.Message));
                    hasError = true;
                    summary.Failure = summary.Failure++;
                    continue;
                }
            }
            summary.EndTime = DateTime.Now;

            Remax_Entities remax_Entities = new Remax_Entities();
            remax_Entities.Monitorings.AddRange(monitoringList);

            int recordAffected = 0;
            User serviceUser = (from u in remax_Entities.Users
                                where (string.IsNullOrEmpty(u.FullName) ? "" : u.FullName).ToLower() == "service"
                                select u).FirstOrDefault();

            remax_Entities.ServiceUser = serviceUser;

            try
            {
                recordAffected = await remax_Entities.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                hasError = true;
                logger.Error(ex.Message, ex);

                summary.Failure += summary.Total - recordAffected;
            }
            summary.DatabaseInsert = recordAffected;
            summary.SuccessfullyProcessed = !hasError;
            return summary;
        }

        protected string GetFileName(string fullPath)
        {
            int count = 1;

            string fileNameOnly = Path.GetFileNameWithoutExtension(fullPath);
            string extension = Path.GetExtension(fullPath);
            string path = Path.GetDirectoryName(fullPath);
            string newFullPath = fullPath;

            while (File.Exists(newFullPath))
            {
                string tempFileName = string.Format("{0}({1})", fileNameOnly, count++);
                newFullPath = Path.Combine(path, tempFileName + extension);
            }

            return newFullPath;
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

        private string GetOAuthToken(string user, string pwd) {
            WebRequest webRequest = WebRequest.Create(Url.Content("~/").ToString() + "/Token");
            webRequest.Method = "POST";
            webRequest.ContentType = "application/json;charset=UTF-8";
            string strJson = JsonConvert.SerializeObject(new {
                grant_type = "password",
                username = user,
                password = pwd
            });

            Stream s = webRequest.GetRequestStream();
            byte[] bytes = Encoding.UTF8.GetBytes(strJson);
            s.Write(bytes, 0, bytes.Length);

            WebResponse webResponse = webRequest.GetResponse();
            Stream rStream = webResponse.GetResponseStream();
            StreamReader reader = new StreamReader(rStream);
            string token = reader.ReadToEnd();

            return token;
        }

        [HttpGet]
        [ResponseType(typeof(void))]
        [Route("api/ScheduleJob/ProcessStagingData")]
        public async Task<IHttpActionResult> ProcessStagingData()
        {
        Remax_Entities db = new Remax_Entities();
            //string token = GetOAuthToken("root@daikai.com", "mypassword");
            
            try
            {
                #region --------------------------- Data Extraction --------------------------- 
                var monitoring = from m in db.Monitorings

                                 join v in db.Vessels on m.IMO_No equals v.IMO_No into mv
                                 from m_v in mv.DefaultIfEmpty()

                                 join e in db.Engines on m.SerialNo equals e.SerialNo into me
                                 from m_e in me.DefaultIfEmpty()

                                 join ml in db.Models on m_e.EngineModelID equals ml.Id into mml
                                 from m_ml in mml.DefaultIfEmpty()

                                 join c in db.Channels on
                                     new { m.ChannelNo, ID = m_ml.Id } equals
                                     new { c.ChannelNo, ID = c.ModelID == null ? Guid.Empty : c.ModelID.Value }
                                     into mch
                                 from m_ch in mch.DefaultIfEmpty()

                                 join ct in db.ChartTypes on m_ch.ChartTypeID equals ct.Id into mct
                                 from m_ct in mct.DefaultIfEmpty()

                                 where !(m.Processed.HasValue? m.Processed.Value : false)

                                 select new
                                 {
                                     Id = m.Id,
                                     IMONo = m.IMO_No,
                                     VesselName = m_v.VesselName,
                                     SerialNo = m.SerialNo,
                                     EngineID = m_e.Id,
                                     EngineModelID = m_e.EngineModelID,
                                     ModelName = m_ml.Name,
                                     ChannelNo = m.ChannelNo,
                                     DisplayUnit = m.Unit,
                                     IncomingChannelName = m.ChannelDescription,
                                     ChannelName = m_ch.Name,
                                     ChartType = m_ct.Name,
                                     Processed = m.Processed
                                 };
                #endregion

                #region --------------------------- Creating channel if doesn't exists --------------------------- 
                List<Channel> newChannels = new List<Channel>();
                foreach (var m in monitoring)
                {
                    var monitor = db.Monitorings.Where(mo => mo.Id == m.Id).FirstOrDefault();
                    bool error = false;

                    if (monitor != null)
                    {
                        monitor.ProcessedError = string.Empty;
                        if (m.VesselName == null) monitor.ProcessedError += "IMO number not found.";
                        if (m.EngineID == null) monitor.ProcessedError += "Engine not found. ";
                        if (m.EngineModelID == null) monitor.ProcessedError += "Engine model not found. ";

                        monitor.ProcessedError = monitor.ProcessedError.Trim();

                        error = (m.VesselName ==null || m.EngineID == null || m.EngineModelID == null);

                        monitor.Processed = true;
                        db.Entry(monitor).State = System.Data.Entity.EntityState.Modified;
                    }

                    // No channel name found but have incoming channel name and no error i.e. engine serial no. not found
                    if (m.ChannelName == null && !string.IsNullOrEmpty(m.IncomingChannelName) && !error) // Consider new channel for related engine model
                    {
                        Channel c = new Channel()
                        {
                            ChannelNo = m.ChannelNo,
                            Name = m.IncomingChannelName,
                            ModelID = m.EngineModelID,
                            DisplayUnit = m.DisplayUnit,
                            //Id = Guid.NewGuid(),
                            //CreatedBy = Guid.Empty,
                            //CreatedOn = DateTime.Now,
                            //ModifiedBy = Guid.Empty,
                            //ModifiedOn = DateTime.Now
                        };

                        var checkChannelDB = db.Channels.Where(
                                ch => ch.ChannelNo.ToLower() == (string.IsNullOrEmpty(c.ChannelNo) ? "" : c.ChannelNo.ToLower())
                                    && ch.ModelID == m.EngineModelID
                            ).FirstOrDefault();

                        var checkChannelMemory = newChannels.Where(
                                ch => ch.ChannelNo.ToLower() == (string.IsNullOrEmpty(c.ChannelNo) ? "" : c.ChannelNo.ToLower())
                                    && ch.ModelID == m.EngineModelID
                            ).FirstOrDefault();

                        if (checkChannelDB == null && checkChannelMemory == null)
                        {
                            newChannels.Add(c);
                            db.Channels.Add(c);
                            db.Entry(c).State = System.Data.Entity.EntityState.Added;
                        }
                    }
                }


                User serviceUser = (from u in db.Users
                                    where (string.IsNullOrEmpty(u.FullName) ? "" : u.FullName).ToLower() == "service"
                                    select u).FirstOrDefault();

                db.ServiceUser = serviceUser;

                await db.SaveChangesAsync();
                #endregion
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                    logger.Error(ex.InnerException.Message, ex.InnerException);
                else
                    logger.Error(ex.Message, ex);

                return StatusCode(HttpStatusCode.InternalServerError);
            }

            return StatusCode(HttpStatusCode.OK);
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
        public List<string> ErrorList { get; set; }
        public bool SuccessfullyProcessed { get; set; }
    }
}
