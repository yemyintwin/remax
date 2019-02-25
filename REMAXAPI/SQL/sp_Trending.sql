SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ye
-- Create date: 2019-Feb-18
-- Description:	Trending Report v1.0
-- =============================================
ALTER PROCEDURE sp_Trending
	@VesselId		nvarchar(50),
	@EngineId		nvarchar(50),
	@FromDate		datetime,
	@ToDate			datetime,
	@CurrentUser	nvarchar(50)
AS
BEGIN
	SET NOCOUNT ON;
	
	DECLARE 
		@offset			decimal(18,0)
		, @readLevel	smallint
		, @accountId	uniqueidentifier
		, @vessel		uniqueidentifier
		, @engine		uniqueidentifier
		, @userid		uniqueidentifier
	
	SELECT @vessel = Convert(uniqueidentifier, @VesselId)
		, @engine = Convert(uniqueidentifier, @EngineId)
		, @userid = Convert(uniqueidentifier, @CurrentUser)

	SELECT @offset = ct.Offset
		, @accountId = u.AccountID
	FROM [User] u
		left outer join Country c on u.Country = c.Id
		left outer join CountryTimezone ct on c.Code = ct.CountryCode
	WHERE u.Id = @userid

	SET @FromDate = DATEADD(SECOND, @offset * -1, @FromDate)
	SET @ToDate = DATEADD(SECOND, @offset * -1, @ToDate)
	SET @ToDate = DATEADD(DAY, 1, @ToDate)

	PRINT @FromDate
	PRINT @ToDate

	-- Current User, Resource=Vessel, 1=Read, 2=Write, 3=Delete, 4=Execute
	SELECT @readLevel = dbo.[fn_ResourcePermission](@userid, 'Vessel', 1) 

    SELECT 
		m.Id													[Id]
		, v.IMO_No												[IMONo]
		, DATEADD(SECOND, @offset, m.TimeStamp)					[TimeStamp]
		, CAST(DATEADD(SECOND, @offset, m.TimeStamp) as date)	[TimeStampDateOnly]
		, v.VesselName											[VesselName]
		--------------------------------------- 5 ------------------------------------------
		, e.SerialNo											[SerialNo]
		, e.Id													[EngineID]
		, e.EngineModelID										[EngineModelID]
		, ml.Name												[ModelName]
		, c.ChannelNo											[ChannelNo]
		--------------------------------------- 10 ------------------------------------------
		, m.Value												[Value]
		, c.DisplayUnit											[DisplayUnit]
		, m.ChannelDescription									[IncomingChannelName]
		, c.Name												[ChannelName]
		, ct.Name												[ChartType]
		--------------------------------------- 15 ------------------------------------------
		, m.Processed											[Processed]
		, c.DashboardDisplay									[DashboardDisplay]
	FROM Monitoring m
		left outer join Vessel v on m.IMO_No = v.IMO_No
		left outer join Engine e on m.SerialNo = e.SerialNo
		left outer join Model ml on e.EngineModelID = ml.Id
		left outer join Channel c on c.ChannelNo = m.ChannelNo and c.ModelID = ml.Id
		left outer join ChartType ct on c.ChartTypeID = ct.Id
	WHERE m.TimeStamp >= @FromDate and m.TimeStamp <= @ToDate
		AND v.Id = @vessel
		AND e.Id = @engine
		AND 
		(
			( v.OwnerID = @accountId and @readLevel >= 1)
			OR 
			( v.OperatorID = @accountId and @readLevel >= 1)
		) 
	ORDER BY v.VesselName, e.SerialNo, m.CreatedOn DESC
END
GO

/*
DECLARE	@return_value int

EXEC	@return_value = [dbo].[sp_ResourcePermission]
		@userid = '80BBCCFF-4B42-E811-80C4-BC305B849686',
		@resource_name = N'Vessel',
		@operation_type = 1

EXEC	@return_value = [dbo].[sp_Trending]
		@VesselId = '7B4D3DE1-DE59-E811-B8BD-985FD3CAFDA6',
		@EngineId = '7B003A28-8956-465B-BBB6-ECA49C1EA4EE',
		@FromDate = N'2019-01-28',
		@ToDate = N'2019-01-28',
		@CurrentUser = '80BBCCFF-4B42-E811-80C4-BC305B849686'
GO
*/