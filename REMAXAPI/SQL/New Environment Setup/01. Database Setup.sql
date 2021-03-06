USE [master]
GO
/****** Object:  Database [DB_A38003_DEV]    Script Date: 1/6/2018 12:10:41 AM ******/
CREATE DATABASE [DB_A38003_DEV]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'DB_A38003_DEV_Data', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL13.SQLEXPRESS\MSSQL\DATA\DB_A38003_DEV_DATA.mdf' , SIZE = 8192KB , MAXSIZE = 1024000KB , FILEGROWTH = 10%)
 LOG ON 
( NAME = N'DB_A38003_DEV_Log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL13.SQLEXPRESS\MSSQL\DATA\DB_A38003_DEV_Log.LDF' , SIZE = 3072KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [DB_A38003_DEV] SET COMPATIBILITY_LEVEL = 130
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [DB_A38003_DEV].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [DB_A38003_DEV] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET ARITHABORT OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [DB_A38003_DEV] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [DB_A38003_DEV] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET  DISABLE_BROKER 
GO
ALTER DATABASE [DB_A38003_DEV] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [DB_A38003_DEV] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [DB_A38003_DEV] SET  MULTI_USER 
GO
ALTER DATABASE [DB_A38003_DEV] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [DB_A38003_DEV] SET DB_CHAINING OFF 
GO
ALTER DATABASE [DB_A38003_DEV] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [DB_A38003_DEV] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [DB_A38003_DEV] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [DB_A38003_DEV] SET QUERY_STORE = OFF
GO
USE [DB_A38003_DEV]
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET LEGACY_CARDINALITY_ESTIMATION = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET MAXDOP = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET PARAMETER_SNIFFING = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET QUERY_OPTIMIZER_HOTFIXES = PRIMARY;
GO
USE [DB_A38003_DEV]
GO
/****** Object:  Table [dbo].[Account]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Account](
	[Id] [uniqueidentifier] NOT NULL,
	[AccountID] [nvarchar](50) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[PrimaryContact] [nvarchar](100) NULL,
	[MainPhone] [nvarchar](100) NULL,
	[Fax] [nvarchar](100) NULL,
	[Email] [nvarchar](100) NULL,
	[Status] [int] NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [uniqueidentifier] NOT NULL,
	[ModifiedOn] [datetime] NOT NULL,
 CONSTRAINT [PK__Account__3214EC07044DE672] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[FilteredAccount]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[FilteredAccount] AS
SELECT *
FROM Account
GO
/****** Object:  Table [dbo].[AlternatorMaker]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AlternatorMaker](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_AlternatorMaker] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Channel]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Channel](
	[Id] [uniqueidentifier] NOT NULL,
	[ChannelNo] [int] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[ModelID] [uniqueidentifier] NULL,
	[DashboardDisplay] [bit] NULL,
	[ChartTypeID] [uniqueidentifier] NULL,
	[MinRange] [decimal](18, 2) NULL,
	[MaxRange] [decimal](18, 2) NULL,
	[Scale] [decimal](18, 2) NULL,
	[DisplayUnit] [nvarchar](50) NULL,
	[LowerLimit] [decimal](18, 2) NULL,
	[UpperLimit] [decimal](18, 2) NULL,
	[MonitoringTimer] [decimal](18, 2) NULL,
	[DataTypeNo] [int] NULL,
	[Status] [int] NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [uniqueidentifier] NOT NULL,
	[ModifiedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_Channel] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChartType]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChartType](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_ChartType] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Country]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Country](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NULL,
 CONSTRAINT [PK_Country] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DashboardSetting]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DashboardSetting](
	[Id] [uniqueidentifier] NOT NULL,
	[ModelNo] [uniqueidentifier] NOT NULL,
	[ChannelNo] [uniqueidentifier] NOT NULL,
	[DisplayOnDashboard] [bit] NULL,
	[ChartType] [int] NOT NULL,
	[ChartGroupNo] [int] NULL,
 CONSTRAINT [PK_DashboardSetting] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Engine]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Engine](
	[Id] [uniqueidentifier] NOT NULL,
	[VesselID] [uniqueidentifier] NOT NULL,
	[EngineTypeID] [uniqueidentifier] NULL,
	[EngineModelID] [uniqueidentifier] NULL,
	[SerialNo] [nvarchar](100) NOT NULL,
	[OutputPower] [decimal](18, 2) NULL,
	[GearBoxModel] [nvarchar](100) NULL,
	[GearBoxSerialNo] [nvarchar](100) NULL,
	[GearRatio] [nvarchar](100) NULL,
	[AlternatorMakerID] [uniqueidentifier] NULL,
	[AlternatorMakerModel] [nvarchar](100) NULL,
	[AlternatorSrNo] [nvarchar](100) NULL,
	[AlternatorOutput] [decimal](18, 2) NULL,
	[PowerSupplySystem] [nvarchar](100) NULL,
	[InsulationTempRise] [decimal](18, 2) NULL,
	[IPRating] [nvarchar](100) NULL,
	[Mounting] [nvarchar](100) NULL,
	[Status] [int] NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [uniqueidentifier] NOT NULL,
	[ModifiedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_Engine] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EngineType]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EngineType](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NULL,
 CONSTRAINT [PK_EngineType] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Model]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Model](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[EngineTypeID] [uniqueidentifier] NULL,
 CONSTRAINT [PK_ModelNo] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Monitoring]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Monitoring](
	[Id] [uniqueidentifier] NOT NULL,
	[IMO_No] [nvarchar](50) NOT NULL,
	[SerialNo] [nvarchar](100) NOT NULL,
	[ChannelNo] [int] NOT NULL,
	[ChannelDescription] [nvarchar](100) NULL,
	[TimeStamp] [datetime] NOT NULL,
	[Value] [nvarchar](500) NOT NULL,
	[Unit] [nvarchar](50) NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [uniqueidentifier] NOT NULL,
	[ModifiedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_Monitoring] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OptionSet]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OptionSet](
	[Id] [uniqueidentifier] NOT NULL,
	[GroupId] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Value] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
 CONSTRAINT [PK_OptionSet] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OptionSetGroup]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OptionSetGroup](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NULL,
 CONSTRAINT [PK_OptionSetGroup] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Resource]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Resource](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](100) NULL,
 CONSTRAINT [PK_Resource_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ResourcePermission]    Script Date: 1/6/2018 12:10:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ResourcePermission](
	[RoleId] [uniqueidentifier] NOT NULL,
	[ResourceId] [int] NOT NULL,
	[ReadPermission] [tinyint] NULL,
	[WritePermission] [tinyint] NULL,
	[DeletePermission] [tinyint] NULL,
	[ExecutePermission] [tinyint] NULL,
 CONSTRAINT [PK_ResourcePermission] PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC,
	[ResourceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ShipClass]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ShipClass](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ShipType]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ShipType](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[Id] [uniqueidentifier] NOT NULL,
	[Email] [nvarchar](256) NOT NULL,
	[EmailConfirmed] [bit] NULL,
	[PasswordHash] [nvarchar](100) NULL,
	[SecurityStamp] [nvarchar](100) NULL,
	[ConcurrencyStamp] [uniqueidentifier] NULL,
	[PhoneNumber] [nvarchar](50) NULL,
	[PhoneNumberConfirmed] [bit] NULL,
	[TwoFactorEnabled] [bit] NULL,
	[LockoutEnd] [datetime] NULL,
	[LockoutEnabled] [bit] NULL,
	[AccessFailedCount] [smallint] NULL,
	[FullName] [nvarchar](100) NOT NULL,
	[AccountID] [uniqueidentifier] NOT NULL,
	[JobTitle] [nvarchar](100) NULL,
	[BusinessPhoneNumber] [nvarchar](50) NULL,
	[IsRootUser] [bit] NULL,
	[Status] [int] NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [uniqueidentifier] NOT NULL,
	[ModifiedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_User_Id] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserClaim]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserClaim](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[Type] [nvarchar](256) NULL,
	[Value] [nvarchar](4000) NULL,
 CONSTRAINT [PK_UserClaim_Id] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserLogin]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserLogin](
	[Name] [nvarchar](50) NOT NULL,
	[Key] [nvarchar](100) NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_UserLogin_Name_Key] PRIMARY KEY CLUSTERED 
(
	[Name] ASC,
	[Key] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRole]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRole](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](256) NOT NULL,
 CONSTRAINT [PK_UserRole_Id] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UK_UserRole_Name] UNIQUE NONCLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserUserRole]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserUserRole](
	[UserId] [uniqueidentifier] NOT NULL,
	[RoleId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_UserUserRole_UserId_RoleId] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vessel]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vessel](
	[Id] [uniqueidentifier] NOT NULL,
	[IMO_No] [nvarchar](50) NOT NULL,
	[VesselName] [nvarchar](100) NOT NULL,
	[OwnerID] [uniqueidentifier] NOT NULL,
	[OperatorID] [uniqueidentifier] NOT NULL,
	[ShipTypeID] [uniqueidentifier] NULL,
	[ShipyardName] [nvarchar](100) NULL,
	[ShipyardCountry] [uniqueidentifier] NULL,
	[BuildYear] [date] NULL,
	[DeliveryToOwner] [date] NULL,
	[ShipClassID] [uniqueidentifier] NULL,
	[DWT] [decimal](18, 2) NULL,
	[TotalPropulsionPower] [decimal](18, 2) NULL,
	[TotalGeneratorPower] [decimal](18, 2) NULL,
	[Status] [int] NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[ModifiedBy] [uniqueidentifier] NOT NULL,
	[ModifiedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_Vessel] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserClaim_UserId]    Script Date: 1/6/2018 12:10:42 AM ******/
CREATE NONCLUSTERED INDEX [IX_UserClaim_UserId] ON [dbo].[UserClaim]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserLogin_UserId]    Script Date: 1/6/2018 12:10:42 AM ******/
CREATE NONCLUSTERED INDEX [IX_UserLogin_UserId] ON [dbo].[UserLogin]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserUserRole_RoleId]    Script Date: 1/6/2018 12:10:42 AM ******/
CREATE NONCLUSTERED INDEX [IX_UserUserRole_RoleId] ON [dbo].[UserUserRole]
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserUserRole_UserId]    Script Date: 1/6/2018 12:10:42 AM ******/
CREATE NONCLUSTERED INDEX [IX_UserUserRole_UserId] ON [dbo].[UserUserRole]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Account] ADD  CONSTRAINT [DF_Account_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[AlternatorMaker] ADD  CONSTRAINT [DF_AlternatorMaker_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Channel] ADD  CONSTRAINT [DF_Channel_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Channel] ADD  CONSTRAINT [DF_Channel_DashboardDisplay]  DEFAULT ((0)) FOR [DashboardDisplay]
GO
ALTER TABLE [dbo].[ChartType] ADD  CONSTRAINT [DF_ChartType_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Country] ADD  CONSTRAINT [DF_Country_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[DashboardSetting] ADD  CONSTRAINT [DF_DashboardSetting_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[DashboardSetting] ADD  CONSTRAINT [DF_DashboardSetting_DisplayOnDashboard]  DEFAULT ((0)) FOR [DisplayOnDashboard]
GO
ALTER TABLE [dbo].[Engine] ADD  CONSTRAINT [DF_Engine_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[EngineType] ADD  CONSTRAINT [DF_EngineType_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Model] ADD  CONSTRAINT [DF_ModelNo_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Monitoring] ADD  CONSTRAINT [DF_Monitoring_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[OptionSet] ADD  CONSTRAINT [DF_OptionSet_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[OptionSetGroup] ADD  CONSTRAINT [DF_OptionSetGroup_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[ShipClass] ADD  CONSTRAINT [DF_ShipClass_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[ShipType] ADD  CONSTRAINT [DF_ShipType_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_EmailConfirmed]  DEFAULT ((0)) FOR [EmailConfirmed]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_ConcurrencyStamp]  DEFAULT (newid()) FOR [ConcurrencyStamp]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_PhoneNumberConfirmed]  DEFAULT ((0)) FOR [PhoneNumberConfirmed]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_TwoFactorEnabled]  DEFAULT ((0)) FOR [TwoFactorEnabled]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_LockoutEnabled]  DEFAULT ((0)) FOR [LockoutEnabled]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_AccessFailedCount]  DEFAULT ((0)) FOR [AccessFailedCount]
GO
ALTER TABLE [dbo].[UserClaim] ADD  CONSTRAINT [DF_UserClaim_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[UserRole] ADD  CONSTRAINT [DF_UserRole_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Vessel] ADD  CONSTRAINT [DF_Vessel_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [dbo].[Channel]  WITH CHECK ADD  CONSTRAINT [FK_Channel_ChartType] FOREIGN KEY([ChartTypeID])
REFERENCES [dbo].[ChartType] ([Id])
GO
ALTER TABLE [dbo].[Channel] CHECK CONSTRAINT [FK_Channel_ChartType]
GO
ALTER TABLE [dbo].[Channel]  WITH CHECK ADD  CONSTRAINT [FK_Channel_Model] FOREIGN KEY([ModelID])
REFERENCES [dbo].[Model] ([Id])
GO
ALTER TABLE [dbo].[Channel] CHECK CONSTRAINT [FK_Channel_Model]
GO
ALTER TABLE [dbo].[Engine]  WITH CHECK ADD  CONSTRAINT [FK_Engine_AlternatorMaker] FOREIGN KEY([AlternatorMakerID])
REFERENCES [dbo].[AlternatorMaker] ([Id])
GO
ALTER TABLE [dbo].[Engine] CHECK CONSTRAINT [FK_Engine_AlternatorMaker]
GO
ALTER TABLE [dbo].[Engine]  WITH CHECK ADD  CONSTRAINT [FK_Engine_EngineType] FOREIGN KEY([EngineTypeID])
REFERENCES [dbo].[EngineType] ([Id])
GO
ALTER TABLE [dbo].[Engine] CHECK CONSTRAINT [FK_Engine_EngineType]
GO
ALTER TABLE [dbo].[Engine]  WITH CHECK ADD  CONSTRAINT [FK_Engine_Model] FOREIGN KEY([EngineModelID])
REFERENCES [dbo].[Model] ([Id])
GO
ALTER TABLE [dbo].[Engine] CHECK CONSTRAINT [FK_Engine_Model]
GO
ALTER TABLE [dbo].[Engine]  WITH CHECK ADD  CONSTRAINT [FK_Engine_Vessel] FOREIGN KEY([VesselID])
REFERENCES [dbo].[Vessel] ([Id])
GO
ALTER TABLE [dbo].[Engine] CHECK CONSTRAINT [FK_Engine_Vessel]
GO
ALTER TABLE [dbo].[Model]  WITH CHECK ADD  CONSTRAINT [FK_Model_EngineType] FOREIGN KEY([EngineTypeID])
REFERENCES [dbo].[EngineType] ([Id])
GO
ALTER TABLE [dbo].[Model] CHECK CONSTRAINT [FK_Model_EngineType]
GO
ALTER TABLE [dbo].[User]  WITH CHECK ADD  CONSTRAINT [FK_Account_User] FOREIGN KEY([AccountID])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[User] CHECK CONSTRAINT [FK_Account_User]
GO
ALTER TABLE [dbo].[UserClaim]  WITH CHECK ADD  CONSTRAINT [FK_UserClaim_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserClaim] CHECK CONSTRAINT [FK_UserClaim_User]
GO
ALTER TABLE [dbo].[UserLogin]  WITH CHECK ADD  CONSTRAINT [FK_UserLogin_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserLogin] CHECK CONSTRAINT [FK_UserLogin_User]
GO
ALTER TABLE [dbo].[UserUserRole]  WITH CHECK ADD  CONSTRAINT [FK_UserUserRole_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserUserRole] CHECK CONSTRAINT [FK_UserUserRole_User]
GO
ALTER TABLE [dbo].[UserUserRole]  WITH CHECK ADD  CONSTRAINT [FK_UserUserRole_UserRole] FOREIGN KEY([RoleId])
REFERENCES [dbo].[UserRole] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserUserRole] CHECK CONSTRAINT [FK_UserUserRole_UserRole]
GO
ALTER TABLE [dbo].[Vessel]  WITH CHECK ADD  CONSTRAINT [FK_Vessel_Country] FOREIGN KEY([ShipyardCountry])
REFERENCES [dbo].[Country] ([Id])
GO
ALTER TABLE [dbo].[Vessel] CHECK CONSTRAINT [FK_Vessel_Country]
GO
ALTER TABLE [dbo].[Vessel]  WITH CHECK ADD  CONSTRAINT [FK_Vessel_OperatorAccount] FOREIGN KEY([OperatorID])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[Vessel] CHECK CONSTRAINT [FK_Vessel_OperatorAccount]
GO
ALTER TABLE [dbo].[Vessel]  WITH CHECK ADD  CONSTRAINT [FK_Vessel_OwnerAccount] FOREIGN KEY([OwnerID])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[Vessel] CHECK CONSTRAINT [FK_Vessel_OwnerAccount]
GO
ALTER TABLE [dbo].[Vessel]  WITH CHECK ADD  CONSTRAINT [FK_Vessel_ShipClass] FOREIGN KEY([ShipClassID])
REFERENCES [dbo].[ShipClass] ([Id])
GO
ALTER TABLE [dbo].[Vessel] CHECK CONSTRAINT [FK_Vessel_ShipClass]
GO
ALTER TABLE [dbo].[Vessel]  WITH CHECK ADD  CONSTRAINT [FK_Vessel_ShipType] FOREIGN KEY([ShipTypeID])
REFERENCES [dbo].[ShipType] ([Id])
GO
ALTER TABLE [dbo].[Vessel] CHECK CONSTRAINT [FK_Vessel_ShipType]
GO
/****** Object:  StoredProcedure [dbo].[sp_ResourcePermission]    Script Date: 1/6/2018 12:10:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sp_ResourcePermission]
	-- Add the parameters for the stored procedure here
	@userid uniqueidentifier,
	@resource_name nvarchar(100),
	@operation_type int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	declare @resource_id int,
		@permission int
	-- Declare the return variable here
	select @resource_id = id 
	from Resource r
	where r.Name = @resource_name

	select u.Id			[User Id]
		, u.FullName	[User Name]
		, ur.Id			[Role Id]
		, ur.Name		[Role Name]
		, r.Id			[Resource Id]
		, r.Name		[Resource Name]
		, case @operation_type
			when 1 then rp.ReadPermission 
			when 2 then rp.WritePermission 
			when 3 then rp.DeletePermission 
			when 4 then rp.ExecutePermission 
		end [Resource Permission]

	from ResourcePermission rp
		join UserUserRole urr on rp.RoleId = urr.RoleId
		left outer join UserRole ur on urr.RoleId = ur.Id
		left outer join [User] u on urr.UserId = u.Id
		left outer join Resource r on rp.ResourceId = r.Id
	where urr.UserId = @userid and r.Id = @resource_id
END
GO
USE [master]
GO
ALTER DATABASE [DB_A38003_DEV] SET  READ_WRITE 
GO
