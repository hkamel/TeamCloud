﻿/**
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT License.
 */

using Xunit;

// disable parallelization for this test assembly to avoid 
// issues based on singleton values e.g. ReferenceLink.BaseUrl

[assembly: CollectionBehavior(DisableTestParallelization = true)]
