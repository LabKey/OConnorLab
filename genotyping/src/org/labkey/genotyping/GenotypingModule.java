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

package org.labkey.genotyping;

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class GenotypingModule extends DefaultModule
{
    public String getName()
    {
        return "Genotyping";
    }

    public double getVersion()
    {
        return 0.02;
    }

    public boolean hasScripts()
    {
        return true;
    }

    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.singleton(GenotypingWebPart.FACTORY);
    }

    protected void init()
    {
        addController("genotyping", GenotypingController.class);
    }

    public void startup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new GenotypingContainerListener());
        PipelineService.get().registerPipelineProvider(new ImportReadsPipelineProvider(this));
        PipelineService.get().registerPipelineProvider(new SubmitAnalysisPipelineProvider(this));
        PipelineService.get().registerPipelineProvider(new ImportAnalysisPipelineProvider(this));
        GenotypingQuerySchema.register(this);
        ModuleLoader.getInstance().registerFolderType(this, new GenotypingFolderType(this));
    }

    @Override
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    public Set<String> getSchemaNames()
    {
        return Collections.singleton(GenotypingSchema.get().getSchemaName());
    }

    @Override
    public Set<DbSchema> getSchemasToTest()
    {
        return PageFlowUtil.set(GenotypingSchema.get().getSchema());
    }
}