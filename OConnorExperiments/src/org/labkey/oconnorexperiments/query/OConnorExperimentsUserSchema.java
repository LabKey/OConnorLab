/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.oconnorexperiments.query;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.Sets;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.Module;
import org.labkey.api.portal.ProjectUrls;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ViewContext;
import org.labkey.oconnorexperiments.OConnorExperimentsController;
import org.labkey.oconnorexperiments.OConnorExperimentsSchema;
import org.labkey.oconnorexperiments.WorkbookQueryView;
import org.springframework.validation.BindException;

import java.util.Set;

/**
 * User: kevink
 * Date: 5/17/13
 */
public class OConnorExperimentsUserSchema extends UserSchema
{
    public static final String NAME = "OConnorExperiments";

    public enum Table
    {
        Experiments,
        ExperimentType,
        ParentExperiments
    }

    public static void register(Module module)
    {
        DefaultSchema.registerProvider(NAME, new DefaultSchema.SchemaProvider(module) {
            @Nullable
            @Override
            public QuerySchema createSchema(DefaultSchema schema, Module module)
            {
                return new OConnorExperimentsUserSchema(schema.getUser(), schema.getContainer());
            }
        });
    }

    OConnorExperimentsUserSchema(User user, Container container)
    {
        super(NAME, null, user, container, OConnorExperimentsSchema.getInstance().getSchema());
    }

    @Nullable
    @Override
    public TableInfo createTable(String name, ContainerFilter cf)
    {
        if (Table.Experiments.name().equalsIgnoreCase(name))
            return createExperimentsTable(name, cf);
        else if (Table.ParentExperiments.name().equalsIgnoreCase(name))
            return createParentExperimentsTable(name, cf);
        else if (Table.ExperimentType.name().equalsIgnoreCase(name))
            return createExperimentTypeTable(name, cf);

        return null;
    }

    public TableInfo createTable(Table t)
    {
        switch (t)
        {
            case Experiments:       return createExperimentsTable(t.name(), null);
            case ParentExperiments: return createParentExperimentsTable(t.name(), null);
        }

        return null;
    }

    @Override
    public Set<String> getVisibleTableNames()
    {
        return Sets.newCaseInsensitiveHashSet(
                Table.Experiments.name(),
                Table.ExperimentType.name()
        );
    }

    @Override
    public Set<String> getTableNames()
    {
        return Sets.newCaseInsensitiveHashSet(
                Table.Experiments.name(),
                Table.ParentExperiments.name()
        );
    }

    private TableInfo createExperimentsTable(String name, ContainerFilter cf)
    {
        return ExperimentsTable.create(this, name, cf);
    }

    private TableInfo createExperimentTypeTable(String name, ContainerFilter cf)
    {
        SimpleUserSchema.SimpleTable table = new SimpleUserSchema.SimpleTable<>(this, OConnorExperimentsSchema.getInstance().createTableInfoExperimentType(), cf);
        table.init();
        return table;
    }

    private TableInfo createParentExperimentsTable(String name, ContainerFilter cf)
    {
        SimpleUserSchema.SimpleTable table = new SimpleUserSchema.SimpleTable<>(this, OConnorExperimentsSchema.getInstance().createTableInfoParentExperiments(), cf);
        table.init();

        //DetailsURL detailsURL = new DetailsURL(QueryService.get().urlDefault(getContainer(), QueryAction.detailsQueryRow, OConnorExperimentsUserSchema.NAME, Table.Experiments.name(), Collections.<String, Object>emptyMap());
        DetailsURL detailsURL = new DetailsURL(PageFlowUtil.urlProvider(ProjectUrls.class).getBeginURL(getContainer()));
        table.setDetailsURL(detailsURL);

        return table;
    }

    @Override
    public QueryView createView(ViewContext context, QuerySettings settings, BindException errors)
    {
        if (OConnorExperimentsController.EXPERIMENTS.equalsIgnoreCase(settings.getQueryName()))
        {
            return new WorkbookQueryView(context, this);
        }
        return super.createView(context, settings, errors);
    }
}
