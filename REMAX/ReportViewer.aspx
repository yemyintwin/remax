<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ReportViewer.aspx.cs" Inherits="_Default" %>

<%@ Register assembly="Microsoft.ReportViewer.WebForms, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" namespace="Microsoft.Reporting.WebForms" tagprefix="rsweb" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Report - Data Download</title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    
        <asp:ScriptManager ID="ScriptManager1" runat="server">
        </asp:ScriptManager>
    
    </div>
        <rsweb:ReportViewer ID="ReportViewer1" runat="server" Width="800" BackColor="#FFFBF7" ZoomMode="FullPage"
                        BorderWidth="0px" ShowFindControls="False" ShowBackButton="True"
                        ProcessingMode="Remote" ShowPromptAreaButton="False" SizeToReportContent="True">
        </rsweb:ReportViewer>
    </form>
</body>
</html>
