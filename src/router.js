import {GlobalComponents, LocalComponents} from './components';
import VueRouter from 'vue-router';
import store from './store/index';
import * as Keycloak from 'keycloak-js';

const routes = [
    {
        path: '/', component: LocalComponents.Home
    },
    {
        path: '/ose/editquotas', component: LocalComponents.EditQuota
    },
    {
        path: '/ose/newtestproject', component: LocalComponents.NewTestProject
    },
    {
        path: '/ose/newproject', component: LocalComponents.NewProject
    },
    {
        path: '/ose/adminlist', component: LocalComponents.AdminList
    },
    {
        path: '/ose/newserviceaccount', component: LocalComponents.NewServiceAccount
    },
    {
        path: '/ose/newpullsecret', component: LocalComponents.NewPullSecret
    },
    {
        path: '/ose/project', component: LocalComponents.ProjectInformation
    },
    {
        path: '/ose/volume/new', component: LocalComponents.NewVolume
    },
    {
        path: '/ose/volume/fixgluster', component: LocalComponents.FixGluster
    },
    {
        path: '/ose/volume/grow', component: LocalComponents.GrowVolume
    },
    {
        path: '/ddc/billing', component: LocalComponents.DDCBilling
    },
    {
        path: '/aws/lists3buckets', component: LocalComponents.ListS3Buckets
    },
    {
        path: '/aws/news3bucket', component: LocalComponents.NewS3Bucket
    },
    {
        path: '/aws/news3user', component: LocalComponents.NewS3User
    },
    {
        path: '/aws/listec2instances', component: LocalComponents.ListEC2Instances
    },
    {
        path: '/otc/listecs', component: LocalComponents.ListECS
    },
    {
        path: '/otc/newecs', component: LocalComponents.NewECS
    },
    {
        path: '/sematext/newapp', component: LocalComponents.SematextNewApp
    },
    {
        path: '/sematext/applist', component: LocalComponents.SematextAppList
    },
    {
        path: '/sematext/changebilling', component: LocalComponents.SematextChangeBilling
    },
    {
        path: '/sematext/changeplan', component: LocalComponents.SematextChangePlan
    },
    {
        path: '/wzu/artifactory', component: LocalComponents.WZUArtifactory
    },
    {
        path: '/wzu/jira', component: LocalComponents.WZUJira
    },
    {
        path: '/wzu/bitbucket', component: LocalComponents.WZUBitbucket
    },
    {
        path: '/wzu/bitbucketrepo', component: LocalComponents.WZUBitbucketRepo
    },
    {
        path: '/wzu/confluence', component: LocalComponents.WZUConfluence
    },
    {
        path: '/wzu/jenkinscredentials', component: LocalComponents.WZUJenkinsCredentials
    },
    {
        path: '/wzu/alm', component: LocalComponents.WZUALM
    },
    {
        path: '/wzu/tasksuser', component: LocalComponents.TasksUser
    },
    {
        path: '/wzu/devproxy', component: LocalComponents.WZUDevProxy
    },
    {
        path: '/ActiveDirectory/ADGroup', component: LocalComponents.ADGroup
    },
    {
        path: '/ActiveDirectory/Adminaddordelete', component: LocalComponents.ADGroupAdmin
    },
    {
        path: '/ActiveDirectory/UpdateUserGroup', component: LocalComponents.ADGroupUser
    }
];

let config = {
    realm: store.state.ssoRealmName,
    url: store.state.ssoRealmURL,
    clientId: store.state.ssoClientID
}

let keycloak = Keycloak(config);

// mode history is needed with keycloak js, see https://github.com/dsb-norge/vue-keycloak-js/issues/1
const router = new VueRouter({routes, mode: 'history'});

router.beforeEach((to, from, next) => {
    // Cleanup old notifications
    store.commit('setNotification', {notification: {}});
    if (!store.state.user) {
        console.log('Not yet logged in, authenticating.');
        authenticate(next);
    } else {
        // Check if token is still valid
        if (store.state.user && store.state.user.exp < Date.now() / 1000) {
            console.log('Token is no longer valid, authenticating.');
            store.commit('setUser', {user: null});
            authenticate(next);
        } else {
            // Everything fine, go to page
            next();
        }
    }
});

function authenticate(next) {
    keycloak.init({ onLoad: 'check-sso', flow: 'implicit' }).success((authenticated) => {
        if (authenticated) {
            console.log(keycloak)
            store.commit('setUser', {
                user: {
                  name: keycloak.tokenParsed.preferred_username.match(/^.*\\(.*)$/)[1],
                  firstname: keycloak.tokenParsed.given_name,
                  token: keycloak.token,
                  exp: keycloak.tokenParsed.exp
                }
              });
            // Remove hash stuff
            history.replaceState(null, null, ' ');
            next();
        } else {
            keycloak.login({ idpHint: store.state.ssoIdpHint });
        }
    }).error(() =>{
      console.log("SSO authentication error.")
    });
}

export default router;
