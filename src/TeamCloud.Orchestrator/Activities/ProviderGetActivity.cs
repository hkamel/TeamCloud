/**
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT License.
 */

using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using TeamCloud.Data;
using TeamCloud.Model.Data;
using TeamCloud.Orchestration;
using TeamCloud.Orchestrator.Entities;

namespace TeamCloud.Orchestrator.Activities
{
    public class ProviderGetActivity
    {
        private readonly IProviderRepository providersRepository;

        public ProviderGetActivity(IProviderRepository providersRepository)
        {
            this.providersRepository = providersRepository ?? throw new ArgumentNullException(nameof(providersRepository));
        }

        [FunctionName(nameof(ProviderGetActivity))]
        public async Task<ProviderDocument> RunActivity(
            [ActivityTrigger] string providerId)
        {
            var providerDocument = await providersRepository
                .GetAsync(providerId)
                .ConfigureAwait(false);

            return providerDocument;
        }
    }

    internal static class ProviderGetExtension
    {
        public static Task<ProviderDocument> GetProviderAsync(this IDurableOrchestrationContext functionContext, string providerId, bool allowUnsafe = false)
            => functionContext.IsLockedBy<ProviderDocument>(providerId) || allowUnsafe
            ? functionContext.CallActivityWithRetryAsync<ProviderDocument>(nameof(ProviderGetActivity), providerId)
            : throw new NotSupportedException($"Unable to get provider '{providerId}' without acquired lock");
    }
}
