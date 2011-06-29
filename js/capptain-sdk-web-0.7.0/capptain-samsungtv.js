/* Initialize capptain global */
if (!window.capptain)
  /**
   * @type {Object} capptain global namespace.
   */
  window.capptain = {};

/* Define an alert based console, suitable for Samsung TV */
if (!capptain.console)
  /**
   * @typedef {Object}
   */
  capptain.console = (function() {

    /* Common log code */
    var dolog = function(level, args) {

      /* Prepend current timestamp and level to arguments */
      var allArgs = [capptain.utils.printCurrentTime(), level];
      allArgs = allArgs.concat(Array.slice(args));

      /* Join args with space, use alert to print the log */
      alert(allArgs.join(' '));
    };

    /* Build console */
    return {
      log: function() {
        dolog('LOG    ', arguments);
      },
      error: function() {
        dolog('ERROR', arguments);
      },
      warn: function() {
        dolog('WARN ', arguments);
      },
      info: function() {
        dolog('INFO   ', arguments);
      }
    };
  })();


/**
 * @type {boolean} disableAutoConnect Disable automatic connection when
 *       capptain.agent is included.
 */
capptain.disableAutoConnect = true;

/* Can be overridden by user */
if (!capptain.samsungtv)
  /** @typedef {Object} */
  capptain.samsungtv = {};

/* Can be overridden by user */
if (!capptain.samsungtv.networkPluginDomId)
  /**
   * Network object plugin DOM identifier.
   * @type {!string}
   */
  capptain.samsungtv.networkPluginDomId = 'pluginObjectNetwork';

/* Can be overridden by user */
if (!capptain.samsungtv.nnaviPluginDomId)
  /**
   * NNavi object plugin DOM identifier.
   * @type {!string}
   */
  capptain.samsungtv.nnaviPluginDomId = 'pluginObjectNNavi';


/**
 * Call this function in your Main.onLoad function. It will define
 * capptain.deviceId if not overridden, then will connect the Capptain Agent.
 */
capptain.samsungtv.init = function() {

  /* If deviceId is not already set, use Samsung TV DUID (its MD5 hash) */
  if (!capptain.deviceId) {
    var self = capptain.samsungtv;
    var NetworkPlugin = document.getElementById(self.networkPluginDomId);
    var NNaviPlugin = document.getElementById(self.nnaviPluginDomId);
    var duid = NNaviPlugin.GetDUID(NetworkPlugin.GetMAC());
    capptain.deviceId = capptain.MD5.hexdigest(duid);
  }

  /* Connect */
  capptain.agent.connect();
};
