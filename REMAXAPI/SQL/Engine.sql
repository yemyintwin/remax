/*
   Monday, 4 June 201810:37:31 PM
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
ALTER TABLE dbo.Engine
	DROP CONSTRAINT DF_Engine_Id
GO
ALTER TABLE dbo.Engine ADD CONSTRAINT
	DF_Engine_Id DEFAULT newsequentialid() FOR Id
GO
ALTER TABLE dbo.Engine SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.Engine', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Engine', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Engine', 'Object', 'CONTROL') as Contr_Per 