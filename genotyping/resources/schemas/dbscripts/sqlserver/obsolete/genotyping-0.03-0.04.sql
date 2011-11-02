/*
 * Copyright (c) 2010-2011 LabKey Corporation
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

-- Clear all analysis data
DELETE FROM genotyping.AllelesJunction;
DELETE FROM genotyping.ReadsJunction;
DELETE FROM genotyping.Matches;
DELETE FROM genotyping.AnalysisSamples;
DELETE FROM genotyping.Analyses;

-- Switch sample ID from (potentially non-unique) varchar to unique RowId
ALTER TABLE genotyping.Matches
    DROP COLUMN SampleId
GO

ALTER TABLE genotyping.Matches
    ADD SampleId INT NOT NULL
GO

ALTER TABLE genotyping.AnalysisSamples
    DROP COLUMN SampleId
GO

ALTER TABLE genotyping.AnalysisSamples
    ADD SampleId INT NOT NULL
GO