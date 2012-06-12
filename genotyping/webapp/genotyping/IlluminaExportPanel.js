/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 *
 * @class Genotyping.ext.IlluminaSampleExportPanel
 */
Ext4.define('Genotyping.ext.IlluminaSampleExportPanel', {
    extend: 'Ext.panel.Panel',

    sectionNames: ['Header', 'Reads', 'Settings', 'Data'],

    initComponent: function(){

        Ext4.QuickTips.init();

        Ext4.apply(this, {
            title: 'Create Illumina Template',
            itemId: 'illuminaPanel',
            width: '100%',
            defaults: {
                border: false
            },
            items: [{
                html: 'You have chosen to export ' + this.rows.length + ' samples',
                border: false,
                bodyStyle: 'padding: 5px;',
                style: 'padding-bottom: 5px;'
            },{
                xtype: 'tabpanel',
                defaults: {
                    border: false
                },
                listeners: {
                    scope: this,
                    tabchange: this.onTabChange
                },
                items: [{
                    xtype: 'form',
                    title: 'General Info',
                    itemId: 'defaultTab',
                    bodyStyle: 'padding: 5px;',
                    defaults: {
                        width: 400,
                        labelableRenderTpl: LABKEY.ext.Ext4Helper.labelableRenderTpl,
                        labelWidth: 150,
                        listeners: {
                            scope: this,
                            change: function(field, val){

                            }
                        }
                    },
                    items: [{
                        xtype: 'textfield',
                        allowBlank: false,
                        fieldLabel: 'Flow Cell Id',
                        renderData: {
                            helpPopup: 'This should match the ID of the Illumina flow cell.  It will be used as the filename of the template.  If you do not have this value, you can always rename the template file later'
                        },
                        itemId: 'fileName',
                        value: 'Illumina'
                    },{
                        xtype: 'textfield',
                        itemId: 'investigator',
                        fieldLabel: 'Investigator Name',
                        value: LABKEY.Security.currentUser.displayName,
                        section: 'Header'
                    },{
                        xtype: 'textfield',
                        itemId: 'experimentName',
                        fieldLabel: 'Experiment Name',
                        section: 'Header'
                    },{
                        xtype: 'textfield',
                        itemId: 'projectName',
                        fieldLabel: 'Project Name',
                        section: 'Header'
                    },{
                        xtype: 'datefield',
                        itemId: 'dateField',
                        fieldLabel: 'Date',
                        value: new Date(),
                        section: 'Header'
                    },{
                        xtype: 'textfield',
                        itemId: 'description',
                        fieldLabel: 'Descripton',
                        section: 'Header'
                    },{
                        xtype: 'combo',
                        itemId: 'template',
                        fieldLabel: 'Template',
                        queryMode: 'local',
                        allowBlank: false,
                        displayField: 'name',
                        valueField: 'name',
                        value: 'Default',
                        store: Ext4.create('LABKEY.ext4.Store', {
                            schemaName: 'genotyping',
                            queryName: 'IlluminaTemplates',
                            columns: 'name,json,editable',
                            autoLoad: true
                        })
                    }]
                },{
                    title: 'Preview Header',
                    itemId: 'previewTab',
                    bodyStyle: 'padding: 5px;'
                },{
                    title: 'Preview Samples',
                    itemId: 'previewSamplesTab',
                    bodyStyle: 'padding: 5px;'
                }]
            }],
            buttons: [{
                text: 'Download',
                handler: this.onDownload,
                scope: this
            },{
                text: 'Save As Template',
                handler: this.onSaveTemplate,
                hidden: !LABKEY.Security.currentUser.canUpdate,
                scope: this
            },{
                text: 'Cancel',
                handler: function(btn){
                    var url = LABKEY.ActionURL.getParameter('srcURL');
                    if(url)
                        window.location = decodeURIComponent(url)
                    else
                        window.location = LABKEY.ActionURL.buildURL('project', 'start');

                }
            }]
        });

        this.callParent();

        //button should require selection, so this should never happen...
        if(!this.rows || !this.rows.length){
            this.hide();
            alert('No Samples Selected');
        }
    },

    onTabChange: function(panel, newTab, oldTab){
        if (newTab.itemId == 'defaultTab'){

        }
        else if (newTab.itemId == 'previewTab'){
            this.populatePreviewTab();
        }
        else if (newTab.itemId == 'previewSamplesTab'){
            this.populatePreviewSamplesTab();
        }

    },

    populatePreviewSamplesTab: function(){
        var previewTab = this.down('#previewSamplesTab');

        var table = this.generateSamplesPreview();

        previewTab.removeAll();
        previewTab.add({
            border: false,
            xtype: 'container',
            height: 200,
            defaults: {
                border: false
            },
            items: [table],
            buttonAlign: 'left',
            buttons: [{
                text: 'Edit Samples',
                hidden: true,
                scope: this,
                handler: this.onEditSamples
            }]
        });
    },

    populatePreviewTab: function(){;
        var previewTab = this.down('#previewTab');

        var items = this.generateTemplatePreview();
        previewTab.removeAll();
        previewTab.add({
            border: false,
            xtype: 'form',
            defaults: {
                labelSeparator: '',
                labelWidth: 200,
                width: 500
            },
            items: items,
            buttonAlign: 'left',
            buttons: [{
                text: 'Edit Template',
                scope: this,
                handler: this.onEditTemplate
            }]
        });
    },

    parseText: function(text){
        text = text.split(/[\r\n|\r|\n]+/g);

        var vals = {};
        var activeSection = '';
        Ext4.each(text, function(line){
            if(!line)
                return;

            line = line.split(/[\,|\t]+/g);

            var prop = line.shift();
            if(prop.match(/^\[/)){
                prop = prop.replace(/\]|\[/g, '');
                activeSection = prop;
                return;
            }

            if(!vals[activeSection])
                vals[activeSection] = [];

            var val = line.join('');
            vals[activeSection].push([prop, val]);
        }, this);

        return vals;
    },

    buildValuesObj: function(){
        this.down('form').items.each(function(field){
            if(field.isFormField && !field.isValid()){
                console.log(field.itemId);
            }
        });

        var valuesObj = {};
        Ext4.each(this.sectionNames, function(header){
            this.down('form').items.each(function(item){
                if(item.section == header){
                    if(!valuesObj[header])
                        valuesObj[header] = [];

                    valuesObj[header].push([item.fieldLabel, item.getValue()]);
                }
            }, this);
        }, this);

        //apply values from the selected template
        var templateField = this.down('form').down('#template');
        var recIdx = templateField.store.find(templateField.valueField, templateField.getValue());
        var rec = templateField.store.getAt(recIdx);
        if(rec && rec.get('json')){
            try
            {
                var json = Ext4.JSON.decode(rec.get('json'));
                for (var i in json){
                    if(!valuesObj[i])
                        valuesObj[i] = [];

                    valuesObj[i] = valuesObj[i].concat(json[i]);
                }
            }
            catch (error) {
                alert('Something is wrong with this saved template');
            }
        }

        return valuesObj;
    },

    generateTemplatePreview: function(){
        var obj = this.buildValuesObj();
        var rows = [];
        Ext4.each(this.sectionNames, function(section){
            if(obj[section]){
                rows.push({
                    xtype: 'displayfield',
                    fieldLabel: '<b>[' + section + ']</b>'
                });

                Ext4.each(obj[section], function(row){
                    var value = Ext4.isDate(row[1]) ? row[1].format('m/d/Y') : row[1];

                    rows.push({
                        xtype: 'displayfield',
                        fieldLabel: row[0],
                        value: value
                    });
                }, this);
            }
        }, this);

        return rows;
    },

    generateSamplesPreview: function(){
        var rows = this.getDataSectionRows();
        var table = {
            layout: {
                type: 'table',
                columns: rows[0].length,
                defaults: {
                    border: false
                }
            },
            items: []
        };

        Ext4.each(rows, function(row, idx){
            Ext4.each(row, function(cell){
                table.items.push({
                    tag: 'div',
                    autoEl: {
                        style: 'padding: 5px;'
                    },
                    border: false,
                    style: idx ? null : 'border-bottom: black medium solid;',
                    html: Ext4.isEmpty(cell) ? '&nbsp;' : cell.toString()
                });

            }, this);
        }, this);

        return table;
    },

    generateHeaderArray: function(){
        var obj = this.buildValuesObj();
        var rows = [];
        Ext4.each(this.sectionNames, function(section){
            if(obj[section]){
                rows.push(['[' + section + ']']);
                Ext4.each(obj[section], function(row){
                    var value = Ext4.isDate(row[1]) ? row[1].format('m/d/Y') : row[1];
                    var thisRow = [row[0]];
                    if(!Ext4.isEmpty(value))
                        thisRow.push(value);

                    rows.push(thisRow);
                }, this);
            }
        }, this);

        return rows;
    },

    generateHeaderText: function(){
        var rowArray = [];
        Ext4.each(this.generateHeaderArray(), function(row){
            rowArray.push(row.join(','))
        }, this);

        return rowArray.join('\n');
    },

    getDataSectionRows: function(){
        var exportRows = [];

        var sampleColumns = [
            ['Sample_ID', 'Key'],
            ['Sample_Name', 'library_sample_name'],
            ['Sample_Plate', ''],
            ['Sample_Well', ''],
            ['Sample_Project', ''],
            ['index', 'fivemid/mid_sequence'],
            ['I7_Index_ID', 'fivemid'],
            ['index2', 'threemid/mid_sequence'],
            ['I5_Index_ID', 'threemid'],
            ['Description', ''],
            ['GenomeFolder', '']
        ];

        var headerRow = [];
        Ext4.each(sampleColumns, function(col){
            headerRow.push(col[0]);
        }, this);
        exportRows.push(headerRow);

        Ext4.each(this.rows, function(row){
            var toAdd = [];
            Ext4.each(sampleColumns, function(col){
                toAdd.push(row[col[1]]);
            }, this);
            exportRows.push(toAdd);
        }, this);

        return exportRows;
    },

    generateSampleText: function(){
        var text = '';
        var rows = this.getDataSectionRows();
        Ext4.each(rows, function(row){
            text += row.join(',') + '\n';
        }, this);

        return text;
    },

    validateTemplate: function(){
        //TODO
    },

    onEditTemplate: function(btn){
        var tab = this.down('#previewTab');
        tab.removeAll();
        tab.add({
            xtype: 'form',
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This view allows you to edit the raw text in the template.  The template is divided into sections, with each section beginning with a term in brackets (ie. \'[Header]\').  The supported section names are: ' + this.sectionNames.join(', ') + '; however, Data cannot be edited through this page.  Within each section, you can enter rows as name/value pairs, which are separated by a comma. When you are finished editing, hit \'Done Editing\' to view the result.<br><br>NOTE: None of the fields on the General Info tab will be included if you save this template.',
                width: 800,
                style: 'padding-bottom: 10px;',
                border: false
            },{
                xtype: 'textarea',
                itemId: 'sourceField',
                width: 800,
                height: 400,
                value: this.generateHeaderText()
            }],
            buttonAlign: 'left',
            buttons: [{
                text: 'Done Editing',
                scope: this,
                handler: this.onDoneEditing
            },{
                text: 'Cancel',
                scope: this,
                handler: this.populatePreviewTab
            }]
        })
    },

    onEditSamples: function(btn){
        //TODO
    },

    onDoneEditing: function(){
        if(this.down('#previewTab').down('#sourceField')){
            var field = this.down('#sourceField');
            if(field.isDirty()){
                var val = this.parseText(field.getValue());
                this.setValuesFromText(val);
            }
        }
        this.populatePreviewTab();
    },

    setValuesFromText: function(values){
        var json = {};
        var form = this.down('#defaultTab');
        for (var section in values){
            Ext4.each(values[section], function(pair){
                var field = form.items.findBy(function(item){
                    return item.section == section && item.fieldLabel == pair[0];
                }, this);

                if(field){
                    field.setValue(pair[1])
                }
                else {
                    if(!json[section])
                        json[section] = [];

                    json[section].push(pair)
                }
            }, this);
        }

        var templateField = this.down('#defaultTab').down('#template');
        var recIdx = templateField.store.find('name', 'Custom');
        if(recIdx == -1){
            var recs = templateField.store.add(new templateField.store.model({}, 'Custom'));
            recs[0].set({
                name: 'Custom',
                json: Ext4.JSON.encode(json)
            });
            recs[0].phantom = true;
        }
        else {
            templateField.store.getAt(recIdx).set('json', json);
        }

        templateField.setValue('Custom');
    },

    onDownload: function(btn){
        this.onDoneEditing();

        var fileNamePrefix = this.down('#defaultTab').down('#fileName').getValue();
        if(!fileNamePrefix){
            alert('Must provide the flow cell Id, which will be used as the filename.  If you do not know this, fill out another value and rename the file later.');
            return;
        }

        var text = this.generateHeaderArray();
        text.push(['[Data]']);
        text = text.concat(this.getDataSectionRows());

        LABKEY.Utils.convertToTable({
            fileNamePrefix: fileNamePrefix,
            delim: 'COMMA',
            exportAsWebPage: LABKEY.ActionURL.getParameter('exportAsWebPage'),
            rows: text
        });
    },

    onSaveTemplate: function(btn){
        //if we're editing the source, need to save first
        this.onDoneEditing();

        var field = this.down('#defaultTab').down('#template');
        var rec = field.store.getAt(field.store.find('name', field.getValue()));

        if(!rec.dirty && !rec.phantom){
            alert('Template is already saved');
        }
        else {
            if(rec.phantom || !rec.get('editable')){
                var msg = 'Choose a name for this template';
                if(!rec.get('editable'))
                    msg = 'This template cannot be edited.  Please choose a different name:';

                Ext4.Msg.prompt('Choose Name', msg, function(btn, msg){
                    if(btn == 'ok'){
                        if(Ext4.isEmpty(msg)){
                            alert('Must enter a name');
                            this.onSaveTemplate();
                            return;
                        }

                        var idx = field.store.find('name', msg);
                        if(idx != -1){
                            alert('Error: name is already is use');
                            this.onSaveTemplate();
                            return;
                        }
                        rec.set('name', msg);
                        this.down('#defaultTab').down('#template').setValue(msg);
                        this.saveTemplate(rec);
                    }
                }, this);
            }
            else {
                this.saveTemplate(rec);
            }
        }
    },

    saveTemplate: function(rec){
        var config = {
            schemaName: 'genotyping',
            queryName: 'IlluminaTemplates',
            rows: [rec.data],
            scope: this,
            success: function(){
                console.log('success');

                var field = this.down('#defaultTab').down('#template');
                field.store.load();
            }
        }

        if(rec.phantom){
            LABKEY.Query.insertRows(config)
        }
        else {
            LABKEY.Query.updateRows(config)
        }
    }
});