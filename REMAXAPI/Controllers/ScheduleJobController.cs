using Newtonsoft.Json;
using REMAXAPI.Models;
using System;
using System.Data;
using System.Data.Entity;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Net;
using System.Net.Mail;
using System.Data.Entity.Infrastructure;

namespace REMAXAPI.Controllers
{
    public class ScheduleJobController : ApiController
    {
        readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private const string INCOMING_DIR = "IncomingDir";
        private const string PROCESSING_DIR = "Processing";
        private const string ARCHIVE_DIR = "Archive";
        private const string ERROR_DIR = "Error";
        private const string EMAIL_ALERT_TEMPLATE_NAME = "EmailAlert";

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
            logger.InfoFormat("Process File start at {0}", DateTime.Now);
            // Moveing incoming files to processing folder
            string[] fileEntries = Directory.GetFiles(this.IncomingFilePath, "*.csv", SearchOption.TopDirectoryOnly);
            foreach (var fileName in fileEntries)
            {
                string fileNameWithoutPath = Path.GetFileName(fileName);
                string processingFile = string.Format(@"{0}\{1}", this.ProcessingFilePath, fileNameWithoutPath);
                
                try
                {
                    // Move file to processing folder
                    if (File.Exists(processingFile)) File.Delete(processingFile);
                    File.Move(fileName, processingFile);
                }
                catch (Exception ex)
                {
                    logger.Error(ex.Message, ex);
                }
            }

            // Process the list of files found in the directory.
            string[] processFileEntries = Directory.GetFiles(this.ProcessingFilePath, "*.csv", SearchOption.TopDirectoryOnly);

            foreach (string fileName in processFileEntries)
            {
                string fileNameWithoutPath = Path.GetFileName(fileName);
                string processingFile = string.Format(@"{0}\{1}", this.ProcessingFilePath, fileNameWithoutPath);
                string archiveFile = string.Format(@"{0}\{1}", this.ArchiveFilePath, fileNameWithoutPath);
                string errorFile = string.Format(@"{0}\{1}", this.ErrorFilePath, fileNameWithoutPath);

                try
                {
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
                    logger.ErrorFormat("Error File Name : {0}{1}{2}", fileNameWithoutPath, Environment.NewLine, ex.StackTrace);

                    try
                    {
                        if (File.Exists(errorFile))
                        {
                            File.Delete(errorFile);
                        }
                        File.Move(processingFile, errorFile);
                    }
                    catch (Exception moveEx)
                    {
                        logger.Error(moveEx.Message, moveEx);
                    }
                    
                }
            }
            logger.InfoFormat("Process Files end at {0}", DateTime.Now);
            logger.InfoFormat(Environment.NewLine);

            await ProcessStagingData();

            return StatusCode(HttpStatusCode.OK);
        }

        protected async Task<FileProcessSummary> ProcessSingleFile(string fileNamePath) {
            FileProcessSummary summary = new FileProcessSummary();
            string[] lines = File.ReadAllLines(fileNamePath);
            bool hasError = false;
            long totalLine = lines.Length;
            int recordAffected = 0;

            if (totalLine > 0)
            {
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

                for (long i = 0; i < lines.Length; i++)
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
                        if (!string.IsNullOrWhiteSpace(raw[3])) monitor.ChannelDescription = RemoveDoubleQuotes(raw[3]);
                        // TimeStamp
                        if (!string.IsNullOrWhiteSpace(raw[4])) monitor.TimeStamp = DateTime.Parse(raw[4]).ToUniversalTime();
                        // Data Values
                        if (!string.IsNullOrWhiteSpace(raw[5])) monitor.Value = RemoveDoubleQuotes(raw[5]);
                        // Unit of Measurement
                        if (!string.IsNullOrWhiteSpace(raw[6])) monitor.Unit = RemoveDoubleQuotes(raw[6]);

                        // System Info
                        //monitor.Id = Guid.NewGuid();
                        //monitor.CreatedBy = Guid.Empty;
                        //monitor.CreatedOn = DateTime.Now;
                        //monitor.ModifiedBy = Guid.Empty;
                        //monitor.ModifiedOn = DateTime.Now;

                        monitor.DataRecord = line;
                        monitor.FileName = Path.GetFileName(fileNamePath);
                        monitor.TimeStampOriginal = raw[4];

                        monitoringList.Add(monitor);
                        summary.Success = summary.Success++;
                    }
                    catch (Exception ex)
                    {
                        summary.ErrorList.Add(string.Format("{0},{1},{2}", line, i.ToString(), ex.Message));
                        hasError = true;
                        summary.Failure++;
                        continue;
                    }
                }
                summary.EndTime = DateTime.Now;

                Remax_Entities remax_Entities = new Remax_Entities();
                remax_Entities.Monitorings.AddRange(monitoringList);

                recordAffected = 0; // Do not remove this
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

                    summary.Failure += (summary.Total - summary.Failure) - recordAffected;
                }
            }
            
            summary.DatabaseInsert = recordAffected;
            summary.Success = recordAffected;
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
            List<Channel> newChannels = new List<Channel>();
            List<Monitoring> monitoringList = new List<Monitoring>();
            List<Alert> alertList = new List<Alert>();

            #region --------------------------- Checking service user & root account ---------------------------

            User serviceUser = (from u in db.Users
                                where (string.IsNullOrEmpty(u.FullName) ? "" : u.FullName).ToLower() == "service"
                                select u).FirstOrDefault();
            if (serviceUser != null)
            {
                db.ServiceUser = serviceUser;
            }
            else
            {
                logger.DebugFormat("Service user not found : Create \"Service\" user.");
                return StatusCode(HttpStatusCode.InternalServerError);
            }

            Account rootAccount = (from a in db.Accounts
                                   where (string.IsNullOrEmpty(a.AccountID) ? "" : a.AccountID).ToLower() == "root"
                                   select a).FirstOrDefault();
            if (rootAccount != null)
            {
                db.RootAccount = rootAccount;
            }
            else
            {
                logger.DebugFormat("Root account not found : Create new account with account ID \"Root\".");
                return StatusCode(HttpStatusCode.InternalServerError);
            }

            #endregion

            logger.InfoFormat("Process Staging Data start at {0}", DateTime.Now);


            try
            {
                #region --------------------------- Vessel & Engine Creation ---------------------------

                // Vessel check and create
                var vesselsCheck = from m in db.Monitorings
                                   where !(m.Processed.HasValue ? m.Processed.Value : false)
                                   group m.IMO_No by m.IMO_No into g
                                   select new
                                   {
                                       g.Key
                                   };

                foreach (var imo in vesselsCheck.ToList())
                {
                    var found = (from v in db.Vessels
                                 where v.IMO_No == imo.Key
                                 select v).FirstOrDefault();
                    if (found == null) {
                        logger.DebugFormat("Creating new Vessel : {0}", imo.Key);

                        Vessel v = new Vessel {
                            IMO_No = imo.Key,
                            VesselName = "No Name",
                            OwnerID = db.RootAccount.Id,
                            OperatorID = db.RootAccount.Id
                        };

                        db.Vessels.Add(v);
                        db.Entry(v).State = System.Data.Entity.EntityState.Added;
                        int rowAffected = await db.SaveChangesAsync();
                        if (rowAffected == 1)
                        {
                            logger.DebugFormat("New Vessel created : {0}", imo.Key);
                        }
                    }
                }

                // Engine check and create
                var enginesCheck = from m in db.Monitorings
                                   where !(m.Processed.HasValue ? m.Processed.Value : false)
                                   group m by new { IMO_No = m.IMO_No, SerialNo = m.SerialNo } into g
                                   select new
                                   {
                                       g.Key
                                   };

                foreach (var eng in enginesCheck.ToList())
                {
                    var vesselFound = (from v in db.Vessels
                                       where v.IMO_No == eng.Key.IMO_No
                                       select v).FirstOrDefault();

                    if (vesselFound != null) {
                        var engineFound = (from e in db.Engines
                                           join v in db.Vessels on e.VesselID equals v.Id into ev
                                           from e_v in ev.DefaultIfEmpty()
                                           where new { e_v.Id, e.SerialNo } == new { vesselFound.Id, eng.Key.SerialNo }
                                           select e).FirstOrDefault();
                        if (engineFound == null)
                        {
                            logger.DebugFormat("Creating new Engine : {0}", new { vesselFound.Id, eng.Key.SerialNo });

                            Engine e = new Engine
                            {
                                VesselID = vesselFound.Id,
                                SerialNo = eng.Key.SerialNo
                            };

                            db.Engines.Add(e);
                            db.Entry(e).State = System.Data.Entity.EntityState.Added;
                            int rowAffected = await db.SaveChangesAsync();
                            if (rowAffected == 1)
                            {
                                logger.DebugFormat("New Engine created : Vessel {0}, Serial No {1}", eng.Key.IMO_No, eng.Key.SerialNo);
                            }
                        }
                    }
                }
                #endregion

                #region --------------------------- Data Extraction (Monitoring and Alert Settings) --------------------------- 
                var monitoring = from m in db.Monitorings

                                 join v in db.Vessels on m.IMO_No equals v.IMO_No into mv
                                 from m_v in mv.DefaultIfEmpty()

                                 join e in db.Engines on m.SerialNo equals e.SerialNo into me
                                 from m_e in me.DefaultIfEmpty()

                                 join ml in db.Models on (m_e.EngineModelID.HasValue? m_e.EngineModelID : Guid.Empty) equals ml.Id into mml
                                 from m_ml in mml.DefaultIfEmpty()

                                 join c in db.Channels on
                                     new { m.ChannelNo, ID = (m_ml != null && m_ml.Id != null) ? m_ml.Id : Guid.Empty } equals
                                     new { c.ChannelNo, ID = c.ModelID.HasValue ? c.ModelID.Value : Guid.Empty }
                                     into mch
                                 from m_ch in mch.DefaultIfEmpty()

                                 join ct in db.ChartTypes on m_ch.ChartTypeID equals ct.Id into mct
                                 from m_ct in mct.DefaultIfEmpty()

                                 where !(m.Processed.HasValue ? m.Processed.Value : false)

                                 select new
                                 {
                                     Id = m.Id,
                                     IMONo = m.IMO_No,
                                     VesselId = m_v.Id,
                                     VesselName = m_v.VesselName,
                                     SerialNo = m.SerialNo,
                                     EngineID = m_e.Id != null ? m_e.Id : Guid.Empty,
                                     EngineModelID = m_e.EngineModelID != null ? m_e.EngineModelID : Guid.Empty,
                                     ModelName = m_ml.Name,
                                     ChannelNo = m.ChannelNo,
                                     ChannelID = m_ch.Id != null ? m_ch.Id : Guid.Empty,
                                     ChannelName = m_ch.Name,
                                     ChannelDocURL = m_ch.DocumentURL,
                                     DisplayUnit = m.Unit,
                                     IncomingChannelName = m.ChannelDescription,

                                     ChartType = m_ct.Name,
                                     Processed = m.Processed,
                                     Value = m.Value
                                 };
                var conditions = from o in db.OptionSets
                                 join og in db.OptionSetGroups on o.GroupId equals og.Id
                                 where og.Name == "condition"
                                 select o;

                var alertLevels = from o in db.OptionSets
                                 join og in db.OptionSetGroups on o.GroupId equals og.Id
                                 where og.Name == "alertlevel"
                                 select o;

                var alertSettings = from s in db.AlertSettings
                                    select s;

                #endregion

                #region --------------------------- Processing data and Creating Alerts --------------------------- 

                // Do not remove ToList() in below line, it will trigger "There is already an open DataReader associated with this Command which must be closed first."
                logger.DebugFormat("Total line to process : {0}", monitoring.ToList().Count());
                foreach (var m in monitoring.ToList())
                {
                    var monitor = db.Monitorings.Where(mo => mo.Id == m.Id).FirstOrDefault();
                    bool error = false;

                    if (monitor != null)
                    {
                        #region --------------------------- Processing monitoring data --------------------------- 

                        monitor.ProcessedError = string.Empty;
                        if (m.VesselName == null) monitor.ProcessedError += "IMO number not found.";
                        if (m.EngineID == null || m.EngineID == Guid.Empty) monitor.ProcessedError += "Engine not found. ";
                        if (m.EngineModelID == null || m.EngineModelID == Guid.Empty) monitor.ProcessedError += "Engine model not found. ";

                        monitor.ProcessedError = monitor.ProcessedError.Trim();

                        error = (m.VesselName == null || 
                            m.EngineID == null || m.EngineID == Guid.Empty ||
                            m.EngineModelID == null || m.EngineModelID == Guid.Empty
                            );


                        if (!error) monitor.Processed = true;

                        monitoringList.Add(monitor);

                        #endregion

                        #region --------------------------- Checking and Adding Alerts  --------------------------- 

                        var foundAlert = alertSettings.Where(s => s.EngineModelID == m.EngineModelID && s.ChannelID == m.ChannelID).FirstOrDefault();

                        if (foundAlert != null) {
                            string strAVal = foundAlert.Value;
                            string strMVal = m.Value;

                            decimal aVal = decimal.MinValue;
                            decimal mVal = decimal.MinValue;

                            decimal.TryParse(strAVal, out aVal);
                            decimal.TryParse(strMVal, out mVal);

                            bool isAlertValIsNumber = aVal != decimal.MinValue;
                            bool isNeed2Alert = false;

                            switch (foundAlert.Condition)
                            {
                                case 1: //Equal to
                                    if (isAlertValIsNumber) isNeed2Alert = (mVal == aVal); //number equal
                                    else isNeed2Alert = (strMVal.Trim().ToLower() == strAVal.Trim().ToLower()); //string equal
                                    break;
                                case 2: //Not equal to
                                    if (isAlertValIsNumber) isNeed2Alert = (mVal != aVal); //number not equal
                                    else isNeed2Alert = (strMVal.Trim().ToLower() != strAVal.Trim().ToLower()); //string not equal
                                    break;
                                case 3: //Greater than
                                    if (isAlertValIsNumber) isNeed2Alert = (mVal > aVal); //number not equal
                                    break;
                                case 4: //Less than
                                    if (isAlertValIsNumber) isNeed2Alert = (mVal < aVal); //number not equal
                                    break;
                                case 5: //Greater than or equal to
                                    if (isAlertValIsNumber) isNeed2Alert = (mVal >= aVal); //number not equal
                                    break;
                                case 6: //Less than or equal to
                                    if (isAlertValIsNumber) isNeed2Alert = (mVal <= aVal); //number not equal
                                    break;
                                default:
                                    isNeed2Alert = false;
                                    break;
                            }

                            if (isNeed2Alert) {
                                logger.InfoFormat("Alert found: [AlertID:{0}] [MonintoringID:{1}]", foundAlert.Id, m.Id);

                                EmailTemplate emailTemplate = (from t in db.EmailTemplates
                                                               where t.Name.ToLower() == EMAIL_ALERT_TEMPLATE_NAME
                                                               select t).FirstOrDefault();

                                IQueryable<Vessel> vessels = from v in db.Vessels
                                                              where v.IMO_No == m.IMONo
                                                              select v;

                                Vessel vesselFound = vessels.Include("OperatorAccount").Include("OwnerAccount").FirstOrDefault();

                                if (emailTemplate != null && vesselFound != null)
                                {
                                    logger.InfoFormat("Alert creating.");

                                    string emails = string.Empty;
                                    if (vesselFound.OwnerAccount != null && vesselFound.OwnerAccount.Email != null) {
                                        if (IsValidEmail(vesselFound.OwnerAccount.Email)) emails += vesselFound.OwnerAccount.Email + ";";
                                    }
                                    if (vesselFound.OperatorAccount != null && vesselFound.OperatorAccount.Email != null)
                                    {
                                        if (IsValidEmail(vesselFound.OperatorAccount.Email)) emails += vesselFound.OperatorAccount.Email + ";";
                                    }

                                    string msg = emailTemplate.Template;
                                    string osCondition = conditions.Where(c => c.Value == foundAlert.Condition).Select(c=>c.Name).FirstOrDefault();
                                    string osAlertLevel = alertLevels.Where(al => al.Value == foundAlert.AlertLevel).Select(al=>al.Name).FirstOrDefault();

                                    string strDocURL = string.Empty;
                                    if (!string.IsNullOrWhiteSpace(m.ChannelDocURL))
                                        strDocURL = string.Format("<a href='{0}' target='_new'>Click here to open troubleshooting document</a>", m.ChannelDocURL);

                                    msg = msg.Replace("[[Vessel.IMO_No]]", m.IMONo)
                                        .Replace("[[Engine.SerialNo]]", m.SerialNo)
                                        .Replace("[[Channel.Name]]", m.ChannelName)
                                        .Replace("[[AlertSetting.Condition]]", osCondition != null? osCondition.ToLower() : "")
                                        .Replace("[[AlertSetting.Value]]", foundAlert.Value)
                                        .Replace("[[AlertSetting.AlertLevel]]", osAlertLevel)
                                        .Replace("[[AlertSetting.Message]]", foundAlert.Message)
                                        .Replace("[[Channel.DocumentURL]]", strDocURL);

                                    Alert a = new Alert()
                                    {
                                        MonitoringId = m.Id,
                                        VesselId = m.VesselId,
                                        IMO_No = m.IMONo,
                                        VesselName = m.VesselName,
                                        EngineId = m.EngineID,
                                        SerialNo = m.SerialNo,
                                        ModelId = m.EngineModelID,
                                        ModelName = m.ModelName,
                                        ChannelId = m.ChannelID,
                                        ChannelName = m.ChannelName,
                                        Value = m.Value,
                                        DisplayUnit = m.DisplayUnit,
                                        AlertSettingId = foundAlert.Id,
                                        Condition = foundAlert.Condition,
                                        ConditionValue = osCondition,
                                        AlertValue = foundAlert.Value,
                                        AlertLevel = foundAlert.AlertLevel,
                                        AlertLevelValue = osAlertLevel,
                                        Recipients = emails,
                                        Subject = string.Format("Alert for {0} - {1}", m.IMONo, m.SerialNo),
                                        AlertMessage = foundAlert.Message,
                                        AlertEmailMessage = msg,
                                        DocumentURL = m.ChannelDocURL,
                                        AlertTime = DateTime.UtcNow
                                    };

                                    // Add to alert collection and update to database later
                                    alertList.Add(a);
                                }
                                else if (emailTemplate == null) {
                                    logger.DebugFormat("Email template {0} not found", EMAIL_ALERT_TEMPLATE_NAME);
                                }
                                else if (vesselFound == null)
                                {
                                    logger.DebugFormat("Vessel not found");
                                }
                            }
                        }

                        #endregion
                    }

                    #region ---------------------- Adding new channels -----------------------
                    // No channel name found but have incoming channel name and no error e.g engine serial no. not found
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

                        if (c.Name.Contains("Port")) c.Side = 1;
                        else if (c.Name.Contains("Starboard") || c.Name.Contains("STBD")) c.Side = 2;

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
                        }
                    }
                    #endregion
                }

                #endregion

                int recordAffected = 0;

                #region ------------------------ Creating new channels ------------------------
                logger.DebugFormat("Total new Channels to be created : {0}", newChannels.ToList().Count());
                foreach (var c in newChannels)
                {
                    db.Channels.Add(c);
                    db.Entry(c).State = System.Data.Entity.EntityState.Added;
                }
                recordAffected = await db.SaveChangesAsync();
                logger.DebugFormat("Total new Channels created : {0}", recordAffected);
                #endregion

                #region ------------------------ Updating monitoring values ------------------------

                logger.DebugFormat("Total values to be processed : {0}", monitoringList.ToList().Count());
                foreach (var m in monitoringList)
                {
                    if (m.Id == null)
                    {
                        db.Monitorings.Add(m);
                        db.Entry(m).State = System.Data.Entity.EntityState.Added;
                    }
                    else {
                        db.Entry(m).State = System.Data.Entity.EntityState.Modified;
                    }
                   
                }
                recordAffected = await db.SaveChangesAsync();
                logger.DebugFormat("Total values processed : {0}", recordAffected);
                
                #endregion

                #region ------------------------ Creating alerts and sending emails------------------------
                logger.DebugFormat("Total alerts to be created : {0}", monitoringList.ToList().Count());
                foreach (var alert in alertList)
                {

                    #region ----------------------- Send alert email -----------------------
                    string emailHost = ConfigurationManager.AppSettings["EmailHost"];
                    string emailPort = ConfigurationManager.AppSettings["EmailPort"];
                    string emailSSL = ConfigurationManager.AppSettings["EmailSSL"];
                    string emailAddr = ConfigurationManager.AppSettings["EmailAddress"];
                    string emailName = ConfigurationManager.AppSettings["EmailName"];
                    string emailPwd = ConfigurationManager.AppSettings["EmailPwd"];

                    var fromAddress = new MailAddress(emailAddr, emailName);
                    string fromPassword = emailPwd;

                    var smtp = new SmtpClient
                    {
                        Host = emailHost,
                        Port = int.Parse(emailPort),
                        EnableSsl = bool.Parse(emailSSL),
                        DeliveryMethod = SmtpDeliveryMethod.Network,
                        UseDefaultCredentials = false,
                        Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
                    };

                    using (var message = new MailMessage()
                    {
                        From = fromAddress,
                        Subject = alert.Subject,
                        Body = alert.AlertEmailMessage,
                        IsBodyHtml = true
                    })
                    {
                        string[] toRecipient = alert.Recipients.Split(new char[] { ';', ',' });
                        foreach (var r in toRecipient)
                        {
                            if (IsValidEmail(r)) message.To.Add(new MailAddress(r));
                        }

                        await smtp.SendMailAsync(message);
                        alert.Notified = true;
                    }
                    #endregion

                    db.Alerts.Add(alert);
                    db.Entry(alert).State = System.Data.Entity.EntityState.Added;

                }
                recordAffected = await db.SaveChangesAsync();
                logger.DebugFormat("Total alert created : {0}", recordAffected);
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

            logger.InfoFormat("Process Staging Data end at {0}", DateTime.Now);
            logger.InfoFormat(Environment.NewLine);
            return StatusCode(HttpStatusCode.OK);
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
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
