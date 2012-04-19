/*
 * Copyright (c) 2011 LabKey Corporation
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

ALTER TABLE Genotyping.Runs
  add Platform varchar(200)
;
go

--all existing runs will be 454
UPDATE genotyping.Runs set Platform = 'LS454';

CREATE TABLE genotyping.SequenceFiles (
  RowId INT IDENTITY(1, 1),
  Run INTEGER NOT NULL,
  DataId INTEGER NOT NULL,
  SampleId INTEGER,
  CONSTRAINT FK_SequenceFiles_Runs FOREIGN KEY (Run) REFERENCES genotyping.Runs (RowId),
  CONSTRAINT FK_SequenceFiles_DataId FOREIGN KEY (DataId) REFERENCES exp.Data (RowId),
  CONSTRAINT PK_SequenceFiles PRIMARY KEY (rowid)
);
