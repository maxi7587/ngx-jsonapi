import { Injectable, Optional } from '@angular/core';
import './services/core-services.service';
import { ICore, IResource, ICollection, IService } from './interfaces';
import { Base } from './services/base';
import { Inject } from '@angular/core';
import { JsonapiConfig } from './jsonapi-config';
import { Http as JsonapiHttp } from './sources/http.service';

@Injectable()
export class Core implements ICore {
    public static me: ICore;
    public static injectedServices: {
        JsonapiStoreService: any;
        JsonapiHttp: any;
        rsJsonapiConfig: any;
    };

    private resourceServices: Object = {};
    public loadingsCounter: number = 0;
    public loadingsStart: Function = (): void => {};
    public loadingsDone: Function = (): void => {};
    public loadingsError: Function = (): void => {};
    public loadingsOffline = (): void => {};

    public config: JsonapiConfig;

    /** @ngInject */
    public constructor(
        @Optional() user_config: JsonapiConfig,
        JsonapiHttp: JsonapiHttp
    ) {
        this.config = new JsonapiConfig();
        for(var k in this.config) this.config[k] = user_config[k] || this.config[k];

        Core.me = this;
        Core.injectedServices = {
            // migrationProblem
            JsonapiStoreService: 'xxxxxxxxxxxxxxxx',
            JsonapiHttp: JsonapiHttp,
            rsJsonapiConfig: this.config
        };
    }

    public _register(clase: IService): boolean {
        if (clase.type in this.resourceServices) {
            return false;
        }
        this.resourceServices[clase.type] = clase;

        return true;
    }

    public getResourceService(type: string): IService {
        return this.resourceServices[type];
    }

    public refreshLoadings(factor: number): void {
        this.loadingsCounter += factor;
        if (this.loadingsCounter === 0) {
            this.loadingsDone();
        } else if (this.loadingsCounter === 1) {
            this.loadingsStart();
        }
    }

    public clearCache(): boolean {
        Core.injectedServices.JsonapiStoreService.clearCache();

        return true;
    }

    // just an helper
    public duplicateResource(resource: IResource, ...relations_alias_to_duplicate_too: Array<string>): IResource {
        let newresource = this.getResourceService(resource.type).new();
        newresource.attributes = { ...newresource.attributes, ...resource.attributes };
        newresource.attributes.name = newresource.attributes.name + ' xXx';
        Base.forEach(resource.relationships, (relationship, alias: string) => {
            if ('id' in relationship.data) {
                // relation hasOne
                if (relations_alias_to_duplicate_too.indexOf(alias) > -1) {
                    newresource.addRelationship(this.duplicateResource(<IResource>relationship.data), alias);
                } else {
                    newresource.addRelationship(<IResource>relationship.data, alias);
                }
            } else {
                // relation hasMany
                if (relations_alias_to_duplicate_too.indexOf(alias) > -1) {
                    Base.forEach(relationship.data, relationresource => {
                        newresource.addRelationship(this.duplicateResource(relationresource), alias);
                    });
                } else {
                    newresource.addRelationships(<ICollection>relationship.data, alias);
                }
            }
        });

        return newresource;
    }
}

// migrationProblem
// angular.module('Jsonapi.services').service('JsonapiCore', Core);
