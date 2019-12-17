/**
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT License.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace TeamCloud
{
    public static class DeleteTeamCloudUserOrchestration
    {
        [FunctionName(nameof(DeleteTeamCloudUserOrchestration))]
        public static async Task<TeamCloud> RunOrchestration(
            [OrchestrationTrigger] IDurableOrchestrationContext functionContext,
            ILogger log)
        {
            (OrchestratorContext orchestratorContext, TeamCloudUser deleteUser) input = functionContext.GetInput<(OrchestratorContext, TeamCloudUser)>();

            var teamCloud = await functionContext.CallActivityAsync<TeamCloud>(nameof(DeleteTeamCloudUserActivity), (input.orchestratorContext.TeamCloud, input.deleteUser));

            // TODO: is this necessary?

            if (input.deleteUser.Role == TeamCloudUserRole.Admin)
            {
                var projects = await functionContext.CallActivityAsync<List<Project>>(nameof(GetProjectsActivity), teamCloud);

                // TODO: this should probably be done in parallel

                foreach (var project in projects)
                {
                    var projectContext = new ProjectContext(teamCloud, project, input.orchestratorContext.User.Id);

                    // TODO: call set users on all providers
                    // var tasks = input.teamCloud.Configuration.Providers.Select(p =>
                    //                 context.CallHttpAsync(HttpMethod.Post, p.Location, JsonConvert.SerializeObject(projectContext)));

                    // await Task.WhenAll(tasks);
                }
            }

            return teamCloud;
        }
    }
}