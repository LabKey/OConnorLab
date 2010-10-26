<%
/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
%>
<%@ page import="org.labkey.genotyping.GenotypingController" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    GenotypingController.ImportReadsBean bean = (GenotypingController.ImportReadsBean)getModelBean();
%>
<form <%=formAction(GenotypingController.ImportReadsAction.class, Method.Post)%> name="importReads">
    <table id="analysesTable">
        <%=formatMissedErrorsInTable("form", 2)%>
        <tr><td colspan="2">Run Information</td></tr>
        <tr><td>Associated Run:</td><td><select name="run"><%
            for (Integer run : bean.getRuns())
            { %><option><%=h(run)%></option>
             <%
            }
        %></select></td></tr>
        <tr><td>&nbsp;</td></tr>
        <tr><td>
            <input type="hidden" name="readyToSubmit" value="1">
            <input type="hidden" name="readsPath" value="<%=h(bean.getReadsPath())%>">
            <input type="hidden" name="analyze" value="0">
        </td></tr>
        <tr><td><%=generateSubmitButton("Import Reads")%><%=PageFlowUtil.generateSubmitButton("Import Reads And Analyze", "document.importReads.analyze.value=1;")%></td></tr>
    </table>
</form>
