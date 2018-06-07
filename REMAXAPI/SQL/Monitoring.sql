/*
   Thursday, 7 June 201812:33:51 AM
   User: 
   Server: DESKTOP-5UCBNHV\SQLEXPRESS
   Database: DB_A38003_DEV
   Application: 
*/

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Monitoring
	DROP CONSTRAINT DF_Monitoring_Id
GO
CREATE TABLE dbo.Tmp_Monitoring
	(
	Id uniqueidentifier NOT NULL,
	IMO_No nvarchar(50) NOT NULL,
	SerialNo nvarchar(100) NOT NULL,
	ChannelNo int NOT NULL,
	ChannelDescription nvarchar(100) NULL,
	TimeStamp datetime NOT NULL,
	Value nvarchar(500) NOT NULL,
	Unit nvarchar(50) NULL,
	CreatedBy uniqueidentifier NULL,
	CreatedOn datetime NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Monitoring SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_Monitoring ADD CONSTRAINT
	DF_Monitoring_Id DEFAULT (newsequentialid()) FOR Id
GO
IF EXISTS(SELECT * FROM dbo.Monitoring)
	 EXEC('INSERT INTO dbo.Tmp_Monitoring (Id, IMO_No, SerialNo, ChannelNo, ChannelDescription, TimeStamp, Value, Unit, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
		SELECT Id, IMO_No, SerialNo, ChannelNo, ChannelDescription, TimeStamp, Value, Unit, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn FROM dbo.Monitoring WITH (HOLDLOCK TABLOCKX)')
GO
DROP TABLE dbo.Monitoring
GO
EXECUTE sp_rename N'dbo.Tmp_Monitoring', N'Monitoring', 'OBJECT' 
GO
ALTER TABLE dbo.Monitoring ADD CONSTRAINT
	PK_Monitoring PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
COMMIT
select Has_Perms_By_Name(N'dbo.Monitoring', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Monitoring', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Monitoring', 'Object', 'CONTROL') as Contr_Per 