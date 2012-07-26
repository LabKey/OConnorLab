/*
 * Copyright (c) 2012 LabKey Corporation
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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.security.User;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 7/18/12
 * Time: 4:08 PM
 */
public class GenotypingQueryHelper extends QueryHelper
{
    public GenotypingQueryHelper(Container c, User user, @NotNull String schemaQueryView)
    {
        super(c, user, schemaQueryView.split(GenotypingFolderSettings.SEPARATOR));
    }
}
