/*
   Sunday, 10 June 201811:03:19 AM
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
	DROP CONSTRAINT FK_Engine_AlternatorMaker
GO
ALTER TABLE dbo.AlternatorMaker SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.AlternatorMaker', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.AlternatorMaker', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.AlternatorMaker', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
ALTER TABLE dbo.Engine
	DROP CONSTRAINT FK_Engine_EngineType
GO
ALTER TABLE dbo.EngineType SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.EngineType', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.EngineType', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.EngineType', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
ALTER TABLE dbo.Engine
	DROP CONSTRAINT FK_Engine_Model
GO
ALTER TABLE dbo.Model SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.Model', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Model', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Model', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
ALTER TABLE dbo.Engine
	DROP CONSTRAINT FK_Engine_Vessel
GO
ALTER TABLE dbo.Vessel SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.Vessel', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Vessel', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Vessel', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
ALTER TABLE dbo.Engine
	DROP CONSTRAINT DF_Engine_Id
GO
CREATE TABLE dbo.Tmp_Engine
	(
	Id uniqueidentifier NOT NULL,
	VesselID uniqueidentifier NOT NULL,
	EngineTypeID uniqueidentifier NULL,
	EngineModelID uniqueidentifier NULL,
	SerialNo nvarchar(100) NOT NULL,
	OutputPower decimal(18, 2) NULL,
	RPM decimal(18, 2) NULL,
	GearBoxModel nvarchar(100) NULL,
	GearBoxSerialNo nvarchar(100) NULL,
	GearRatio nvarchar(100) NULL,
	AlternatorMakerID uniqueidentifier NULL,
	AlternatorMakerModel nvarchar(100) NULL,
	AlternatorSrNo nvarchar(100) NULL,
	AlternatorOutput decimal(18, 2) NULL,
	PowerSupplySystem nvarchar(100) NULL,
	InsulationTempRise decimal(18, 2) NULL,
	IPRating nvarchar(100) NULL,
	Mounting nvarchar(100) NULL,
	Status int NULL,
	CreatedBy uniqueidentifier NOT NULL,
	CreatedOn datetime NOT NULL,
	ModifiedBy uniqueidentifier NOT NULL,
	ModifiedOn datetime NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Engine SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_Engine ADD CONSTRAINT
	DF_Engine_Id DEFAULT (newsequentialid()) FOR Id
GO
IF EXISTS(SELECT * FROM dbo.Engine)
	 EXEC('INSERT INTO dbo.Tmp_Engine (Id, VesselID, EngineTypeID, EngineModelID, SerialNo, OutputPower, GearBoxModel, GearBoxSerialNo, GearRatio, AlternatorMakerID, AlternatorMakerModel, AlternatorSrNo, AlternatorOutput, PowerSupplySystem, InsulationTempRise, IPRating, Mounting, Status, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
		SELECT Id, VesselID, EngineTypeID, EngineModelID, SerialNo, OutputPower, GearBoxModel, GearBoxSerialNo, GearRatio, AlternatorMakerID, AlternatorMakerModel, AlternatorSrNo, AlternatorOutput, PowerSupplySystem, InsulationTempRise, IPRating, Mounting, Status, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn FROM dbo.Engine WITH (HOLDLOCK TABLOCKX)')
GO
DROP TABLE dbo.Engine
GO
EXECUTE sp_rename N'dbo.Tmp_Engine', N'Engine', 'OBJECT' 
GO
ALTER TABLE dbo.Engine ADD CONSTRAINT
	PK_Engine PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.Engine ADD CONSTRAINT
	FK_Engine_Vessel FOREIGN KEY
	(
	VesselID
	) REFERENCES dbo.Vessel
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Engine ADD CONSTRAINT
	FK_Engine_Model FOREIGN KEY
	(
	EngineModelID
	) REFERENCES dbo.Model
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Engine ADD CONSTRAINT
	FK_Engine_EngineType FOREIGN KEY
	(
	EngineTypeID
	) REFERENCES dbo.EngineType
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Engine ADD CONSTRAINT
	FK_Engine_AlternatorMaker FOREIGN KEY
	(
	AlternatorMakerID
	) REFERENCES dbo.AlternatorMaker
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
select Has_Perms_By_Name(N'dbo.Engine', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Engine', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Engine', 'Object', 'CONTROL') as Contr_Per 